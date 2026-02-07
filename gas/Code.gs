/**
 * Chores Tracker - Google Apps Script Web App
 * Deploy as Web App, execute as: Me, Who has access: Anyone.
 * Use SETTINGS.token for auth (query param or body).
 */

var SHEET_NAME_TASKS = 'TASKS';
var SHEET_NAME_STATUS = 'STATUS';
var SHEET_NAME_SETTINGS = 'SETTINGS';

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(name) {
  return getSpreadsheet().getSheetByName(name);
}

function getSetting(key) {
  var sheet = getSheet(SHEET_NAME_SETTINGS);
  if (!sheet) return null;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(key)) return String(data[i][1]).trim();
  }
  return null;
}

function validateToken(e) {
  var token = (e.parameter && e.parameter.token) || null;
  if (!token && e.postData && e.postData.contents) {
    try {
      var body = JSON.parse(e.postData.contents);
      token = body.token || null;
    } catch (err) {}
  }
  var expected = getSetting('token');
  return expected && token === expected;
}

function jsonResponse(obj, status) {
  status = status || 200;
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  if (!validateToken(e)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  var action = (e.parameter && e.parameter.action) || '';
  if (action === 'getDay') {
    var date = (e.parameter && e.parameter.date) || '';
    if (!date) return jsonResponse({ error: 'Missing date' }, 400);
    var data = getDayData(date);
    if (data.error) return jsonResponse(data, 400);
    return jsonResponse(data);
  }
  if (action === 'toggle') {
    var date = (e.parameter && e.parameter.date) || '';
    var taskId = (e.parameter && e.parameter.taskId) || '';
    var completed = (e.parameter && e.parameter.completed) === 'true';
    if (!date || !taskId) return jsonResponse({ error: 'Missing date or taskId' }, 400);
    try {
      toggleStatus(date, taskId, completed);
      return jsonResponse({ ok: true });
    } catch (err) {
      return jsonResponse({ error: 'Toggle failed: ' + (err.message || err) }, 500);
    }
  }
  return jsonResponse({ error: 'Invalid action' }, 400);
}

function doPost(e) {
  if (!validateToken(e)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  var action = (e.parameter && e.parameter.action) || '';
  var body = {};
  if (e.postData && e.postData.contents) {
    try {
      body = JSON.parse(e.postData.contents);
    } catch (err) {
      return jsonResponse({ error: 'Invalid JSON' }, 400);
    }
  }
  if (action === 'toggle') {
    var date = body.date, taskId = body.taskId, completed = body.completed;
    if (!date || !taskId) return jsonResponse({ error: 'Missing date or taskId' }, 400);
    toggleStatus(date, taskId, completed === true);
    return jsonResponse({ ok: true });
  }
  return jsonResponse({ error: 'Invalid action' }, 400);
}

// --- Date / schedule helpers ---

function parseDate(dateStr) {
  var parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  var y = parseInt(parts[0], 10), m = parseInt(parts[1], 10), d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return { y: y, m: m, d: d, dateStr: dateStr };
}

var DOW = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

function getDayOfWeek(dateObj) {
  var d = new Date(dateObj.y, dateObj.m - 1, dateObj.d);
  return DOW[d.getDay()];
}

/** 1-based occurrence of this weekday in the month (e.g. 2 = 2nd Tuesday) */
function getWeekOccurrenceInMonth(dateObj) {
  var d = dateObj.d;
  return Math.ceil(d / 7);
}

function getMonthDay(dateObj) {
  return dateObj.m + '-' + (dateObj.d < 10 ? '0' : '') + dateObj.d;
}

function getMMDD(dateObj) {
  var m = dateObj.m < 10 ? '0' + dateObj.m : '' + dateObj.m;
  var d = dateObj.d < 10 ? '0' + dateObj.d : '' + dateObj.d;
  return m + '-' + d;
}

function isTaskDueToday(task, dateObj, dayOfWeek) {
  var scheduleType = (task.scheduleType || '').toUpperCase();
  var days = (task.days || '').toUpperCase().split(',').map(function(s) { return s.trim(); });
  var rule = (task.rule || '').toUpperCase();

  if (scheduleType === 'DAILY') {
    return days.indexOf(dayOfWeek) >= 0;
  }
  if (scheduleType === 'WEEKLY') {
    return days.indexOf(dayOfWeek) >= 0;
  }
  if (scheduleType === 'FORTNIGHTLY') {
    // e.g. FORTNIGHTLY:2ND:TUE
    var occ = getWeekOccurrenceInMonth(dateObj);
    var parts = rule.split(':');
    if (parts.length >= 3 && parts[1].indexOf('ND') >= 0) {
      var n = parseInt(parts[1], 10);
      if (isNaN(n)) n = 2;
      var ruleDay = parts[2];
      return ruleDay === dayOfWeek && occ === n;
    }
    return false;
  }
  if (scheduleType === 'MONTHLY') {
    // MONTHLY:DAY:10
    var dayParts = rule.split(':');
    if (dayParts.length >= 3 && dayParts[1] === 'DAY') {
      var dayNum = parseInt(dayParts[2], 10);
      return dateObj.d === dayNum;
    }
    return false;
  }
  if (scheduleType === 'QUARTERLY') {
    // QUARTERLY:DATE:01-05,04-05,07-05,10-05
    var dateParts = rule.split(':');
    if (dateParts.length >= 3) {
      var allowed = dateParts[2].split(',').map(function(s) { return s.trim(); });
      var mmdd = getMMDD(dateObj);
      return allowed.indexOf(mmdd) >= 0;
    }
    return false;
  }
  return false;
}

function getTasksForDate(dateStr) {
  var dateObj = parseDate(dateStr);
  if (!dateObj) return [];
  var dayOfWeek = getDayOfWeek(dateObj);
  var sheet = getSheet(SHEET_NAME_TASKS);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var taskIdIdx = headers.indexOf('taskId');
  var textIdx = headers.indexOf('text');
  var scheduleTypeIdx = headers.indexOf('scheduleType');
  var daysIdx = headers.indexOf('days');
  var ruleIdx = headers.indexOf('rule');
  var activeIdx = headers.indexOf('active');
  if (taskIdIdx < 0 || textIdx < 0) return [];

  var tasks = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var active = activeIdx >= 0 ? String(row[activeIdx]).toUpperCase() : 'TRUE';
    if (active !== 'TRUE') continue;
    var task = {
      taskId: String(row[taskIdIdx]).trim(),
      text: String(row[textIdx]).trim(),
      scheduleType: scheduleTypeIdx >= 0 ? String(row[scheduleTypeIdx]).trim() : '',
      days: daysIdx >= 0 ? String(row[daysIdx]).trim() : '',
      rule: ruleIdx >= 0 ? String(row[ruleIdx]).trim() : ''
    };
    if (!task.taskId) continue;
    if (isTaskDueToday(task, dateObj, dayOfWeek)) {
      tasks.push({ taskId: task.taskId, text: task.text });
    }
  }
  return tasks;
}

function getStatusesForDate(dateStr) {
  var sheet = getSheet(SHEET_NAME_STATUS);
  if (!sheet) return {};
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var dateIdx = headers.indexOf('date');
  var taskIdIdx = headers.indexOf('taskId');
  var completedIdx = headers.indexOf('completed');
  var timestampIdx = headers.indexOf('timestamp');
  if (dateIdx < 0 || taskIdIdx < 0) return {};
  var map = {};
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[dateIdx]).trim() !== dateStr) continue;
    var tid = String(row[taskIdIdx]).trim();
    map[tid] = {
      completed: completedIdx >= 0 ? String(row[completedIdx]).toUpperCase() === 'TRUE' : false,
      timestamp: timestampIdx >= 0 ? String(row[timestampIdx]).trim() : ''
    };
  }
  return map;
}

function getDayData(dateStr) {
  var dateObj = parseDate(dateStr);
  if (!dateObj) return { error: 'Invalid date' };
  var dayOfWeek = getDayOfWeek(dateObj);
  var holiday = dayOfWeek === 'SUN';
  if (holiday) {
    return { date: dateStr, day: dayOfWeek, holiday: true, tasks: [] };
  }
  var tasks = getTasksForDate(dateStr);
  var statuses = getStatusesForDate(dateStr);
  var result = [];
  for (var i = 0; i < tasks.length; i++) {
    var t = tasks[i];
    var st = statuses[t.taskId] || { completed: false, timestamp: '' };
    result.push({
      taskId: t.taskId,
      text: t.text,
      completed: st.completed,
      timestamp: st.timestamp || undefined
    });
  }
  return { date: dateStr, day: dayOfWeek, holiday: false, tasks: result };
}

function toggleStatus(dateStr, taskId, completed) {
  var sheet = getSheet(SHEET_NAME_STATUS);
  if (!sheet) throw new Error('STATUS sheet not found. Add a tab named STATUS with headers: date, taskId, completed, timestamp');
  var data = sheet.getDataRange().getValues();
  if (!data || data.length === 0) throw new Error('STATUS sheet has no header row');
  var headers = data[0];
  var dateIdx = headers.indexOf('date');
  var taskIdIdx = headers.indexOf('taskId');
  var completedIdx = headers.indexOf('completed');
  var timestampIdx = headers.indexOf('timestamp');
  if (dateIdx < 0 || taskIdIdx < 0) throw new Error('STATUS sheet must have columns: date, taskId');
  if (completedIdx < 0 || timestampIdx < 0) throw new Error('STATUS sheet must have columns: completed, timestamp');

  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][dateIdx]).trim() === dateStr && String(data[i][taskIdIdx]).trim() === taskId) {
      rowIndex = i + 1;
      break;
    }
  }
  var ts = completed ? new Date().toISOString() : '';
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, completedIdx + 1).setValue(completed ? 'TRUE' : 'FALSE');
    sheet.getRange(rowIndex, timestampIdx + 1).setValue(ts);
  } else {
    sheet.appendRow([dateStr, taskId, completed ? 'TRUE' : 'FALSE', ts]);
  }
}

// --- Daily email report (run at 9:00 PM IST, Mon–Sat) ---

function setupDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'sendDailyReport') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sendDailyReport')
    .timeBased()
    .everyDays(1)
    .atHour(21)
    .inTimezone('Asia/Kolkata')
    .create();
}

function sendDailyReport() {
  var now = new Date();
  var dateStr = Utilities.formatDate(now, 'Asia/Kolkata', 'yyyy-MM-dd');
  var parsed = parseDate(dateStr);
  if (!parsed) return;
  if (getDayOfWeek(parsed) === 'SUN') return;

  var done = [], notDone = [];
  var reportUrl = getSetting('report_url');
  var reportToken = getSetting('report_token');
  if (reportUrl && reportToken) {
    try {
      var base = reportUrl.replace(/\?.*$/, '');
      var sep = reportUrl.indexOf('?') >= 0 ? '&' : '?';
      var url = base + sep + 'token=' + encodeURIComponent(reportToken) + '&date=' + encodeURIComponent(dateStr);
      var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      if (resp.getResponseCode() === 200) {
        var data = JSON.parse(resp.getContentText());
        dateStr = data.date || dateStr;
        if (Array.isArray(data.done)) data.done.forEach(function(x) { done.push({ text: x.text || '', time: x.time || '' }); });
        if (Array.isArray(data.notDone)) data.notDone.forEach(function(x) { notDone.push(String(x)); });
      }
    } catch (e) {}
  }
  if (done.length === 0 && notDone.length === 0) {
    var dayData = getDayData(dateStr);
    for (var i = 0; i < dayData.tasks.length; i++) {
      var t = dayData.tasks[i];
      if (t.completed) {
        var time = t.timestamp ? (function(iso) {
          try { var x = new Date(iso); return x.getHours() + ':' + (x.getMinutes() < 10 ? '0' : '') + x.getMinutes(); } catch(err) { return ''; }
        })(t.timestamp) : '';
        done.push({ text: t.text, time: time });
      } else {
        notDone.push(t.text);
      }
    }
  }

  var recipientsStr = getSetting('recipients');
  if (!recipientsStr) return;
  var recipients = recipientsStr.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
  if (recipients.length === 0) return;

  var subject = 'Chores report – ' + dateStr;
  var html = '<h2>Chores report – ' + dateStr + '</h2>';
  html += '<h3>Done</h3><ul>';
  if (done.length === 0) html += '<li>None</li>';
  else done.forEach(function(x) { html += '<li>' + escapeHtml(x.text) + (x.time ? ' (' + x.time + ')' : '') + '</li>'; });
  html += '</ul><h3>Not done</h3><ul>';
  if (notDone.length === 0) html += '<li>None</li>';
  else notDone.forEach(function(x) { html += '<li>' + escapeHtml(x) + '</li>'; });
  html += '</ul>';
  MailApp.sendEmail(recipients.join(','), subject, 'See HTML.', { htmlBody: html });
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
