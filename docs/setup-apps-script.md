# Setup Google Apps Script (GAS) Web App

The app and the daily email report run from a single Google Apps Script project bound to your **Chores Tracker** sheet.

## 1. Open the script editor

1. Open your **Chores Tracker** Google Sheet.
2. In the menu: **Extensions** → **Apps Script**.
3. A new project opens. Name the project (e.g. **Chores Tracker API**).

## 2. Add the code

1. In the script editor you should see a file **Code.gs**. If not, click **+** next to **Files** and add **Script**.
2. **Replace all** content of **Code.gs** with the code from this repo:
   - Open **`gas/Code.gs`** in the Chore Tracker project on your computer.
   - Copy the **entire** contents and paste into the Apps Script **Code.gs** editor (replacing whatever is there).
3. Save (Ctrl+S / Cmd+S).

## 3. Deploy as Web App

1. In the Apps Script editor, click **Deploy** → **New deployment**.
2. Click the gear icon next to **Select type** and choose **Web app**.
3. Set:
   - **Description**: e.g. `Chores API v1`
   - **Execute as**: **Me** (your Google account).
   - **Who has access**: **Anyone** (so the Next.js app can call it without logging in).
4. Click **Deploy**.
5. If asked to **Authorize access**:
   - Choose your Google account.
   - Click **Advanced** → **Go to Chores Tracker API (unsafe)** → **Allow**.
6. Copy the **Web app URL**. It looks like:
   `https://script.google.com/macros/s/XXXXXXXX/exec`
   This is your **NEXT_PUBLIC_GAS_URL**. Do not add `?action=...` at the end; the app adds that when calling.

## 4. Create the 9:00 PM IST daily trigger

1. In the script editor, open the **Code.gs** file.
2. In the function dropdown at the top, select **`setupDailyTrigger`**.
3. Click **Run** (play button).
4. If asked for permissions, approve (same as above).
5. When the run finishes, you should see **Execution log** with no errors. This creates a daily trigger that runs **`sendDailyReport`** every day at **9:00 PM Asia/Kolkata** (IST). The script itself skips Sunday, so no email is sent on Sunday.

To confirm the trigger:

- **Edit** → **Current project’s triggers**. You should see one trigger: **sendDailyReport**, **Time-driven**, **Day timer**, **9pm to 10pm**, **Asia/Kolkata**.

## 5. Security (token)

- The Web App is set to **Anyone** so the URL can be called without login.
- Protection is via the **token** in the SETTINGS tab. The Next.js app sends this as:
  - Query: `?token=YOUR_TOKEN` (for GET and POST).
  - Or in the POST body: `{ "token": "YOUR_TOKEN", "date": "...", "taskId": "...", "completed": true }`.
- Keep the token secret. If it leaks, change it in SETTINGS and update **NEXT_PUBLIC_API_TOKEN** in Vercel.

## 6. API summary

- **GET**  
  `YOUR_WEB_APP_URL/exec?action=getDay&date=YYYY-MM-DD&token=YOUR_TOKEN`  
  Returns: `{ date, day, holiday, tasks: [{ taskId, text, completed, timestamp }] }`.

- **POST**  
  URL: `YOUR_WEB_APP_URL/exec?action=toggle&token=YOUR_TOKEN`  
  Body (JSON): `{ "date": "YYYY-MM-DD", "taskId": "...", "completed": true|false }`  
  When `completed` is true, the script sets a timestamp; when false, it clears it.

After this, use the same **Web app URL** and **token** in the Next.js app (see [Deploy Vercel](deploy-vercel.md)).
