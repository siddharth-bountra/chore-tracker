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

3. In **rows 2–4**, add these three rows (replace with your own values where noted):

   | key      | value                    |
   |----------|--------------------------|
   | recipients | email1@example.com,email2@example.com |
   | token    | your-secret-token-here   |
   | timezone | Asia/Kolkata             |

- **recipients**: Comma-separated list of the **2 email addresses** that will get the daily report.
- **token**: A long random string you make up (e.g. from a password generator). You will use the **same** value as `NEXT_PUBLIC_API_TOKEN` in the Next.js app and (optionally) in the Apps Script Web App URL.
- **timezone**: Keep as `Asia/Kolkata` so the 9:00 PM report runs in IST.

Save the sheet. Next step: [Setup Apps Script](setup-apps-script.md).
