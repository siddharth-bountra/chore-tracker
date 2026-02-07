# Setup Google Sheet (Chores Tracker)

Create one Google Sheet and three tabs. The sheet will act as the database for the app.

## 1. Create the sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a **new** spreadsheet.
2. Name it **Chores Tracker**.

## 2. Create three tabs

Rename the first sheet (or add sheets) so you have exactly these three tab names:

- **TASKS**
- **STATUS**
- **SETTINGS**

## 3. TASKS tab – headers and seed data

1. Click the **TASKS** tab.
2. In **row 1**, type these column headers (one per cell):

   | A       | B     | C             | D     | E     | F      |
   |---------|-------|---------------|-------|-------|--------|
   | taskId  | text  | scheduleType  | days  | rule  | active |

3. Open the file **`docs/seed-tasks.csv`** from this project. Copy **all** of its contents (including the header row).
4. In the sheet, click cell **A2** (first data row).
5. **Paste** (Ctrl+V / Cmd+V). If Google Sheets asks how to paste, choose **Paste as values** or **Paste normally** so that the columns line up.
6. Check that:
   - Row 1 = headers: `taskId`, `text`, `scheduleType`, `days`, `rule`, `active`
   - Rows 2 onward = one task per row.
   - The **rule** column for the last task (quarter-curtain) is one cell with: `QUARTERLY:DATE:01-05,04-05,07-05,10-05`

You can edit tasks later (add, remove, change text or schedule) in this tab.

## 4. STATUS tab – headers only

1. Click the **STATUS** tab.
2. In **row 1**, type these column headers:

   | A     | B       | C          | D          |
   |-------|---------|------------|------------|
   | date  | taskId  | completed  | timestamp  |

Leave rows 2 and below **empty**. The app and the daily email script will add rows when someone checks or unchecks a task.

## 5. SETTINGS tab – keys and values

1. Click the **SETTINGS** tab.
2. In **row 1**, type:

   | A        | B              |
   |----------|----------------|
   | key      | value          |

3. In **rows 2–5**, add these rows (replace with your own values where noted):

   | key         | value                    |
   |-------------|--------------------------|
   | recipients  | email1@example.com,email2@example.com |
   | token       | your-secret-token-here   |
   | timezone    | Asia/Kolkata             |
   | report_url  | https://your-app.vercel.app/api/today-report |
   | report_token| same value as REPORT_API_TOKEN in Vercel |

- **recipients**: Comma-separated list of email addresses that get the daily report.
- **token**: A long random string you make up. Use the same value as `NEXT_PUBLIC_API_TOKEN` in the app (and in the GAS Web App URL).
- **timezone**: Keep as `Asia/Kolkata` so the 9:00 PM report runs in IST.
- **report_url** (optional): Your deployed app’s today-report API URL (e.g. `https://your-project.vercel.app/api/today-report`). When set with **report_token**, the daily email uses **Supabase** as the source of truth instead of the sheet.
- **report_token**: Same secret as `REPORT_API_TOKEN` in Vercel (or `.env.local`). Required if you set report_url.

Save the sheet. Next step: [Setup Apps Script](setup-apps-script.md).

---

## Troubleshooting: STATUS tab not updating when you check tasks

If checking/unchecking tasks in the app doesn’t add or change rows in the STATUS tab:

1. **STATUS tab and headers**
   - The tab name must be exactly **STATUS** (all caps).
   - Row 1 must have exactly these headers in **A1, B1, C1, D1**: `date` | `taskId` | `completed` | `timestamp` (spelling and order matter).

2. **Apps Script**
   - The script must be **bound** to this Chores Tracker spreadsheet (Extensions → Apps Script from the sheet).
   - You must **redeploy** the Web App after adding or changing the toggle code: Deploy → Manage deployments → Edit → New version → Deploy. The app uses **GET** for toggle; an old deployment may not support it.

3. **Vercel / env**
   - In Vercel (or `.env.local`), set **NEXT_PUBLIC_GAS_URL** to the full Web App URL (e.g. `https://script.google.com/macros/s/.../exec`) and **NEXT_PUBLIC_API_TOKEN** to the same value as the **token** row in the SETTINGS tab.

4. **Test in GAS**
   - In the script editor, run: `function testToggle() { toggleStatus('2025-02-10', 'daily-01', true); }` then check the STATUS tab. If a row appears, the sheet and script are fine; the issue is the request from the app (URL, token, or deployment).
