# Chores Tracker

A simple PWA for tracking household chores. Shows today’s tasks with big checkboxes, stores data in Google Sheets via Google Apps Script, and sends a daily email report at 9:00 PM IST (Mon–Sat).

## Quick start

1. **Setup Google Sheet** – [docs/setup-google-sheet.md](docs/setup-google-sheet.md)  
   Create the sheet, tabs, and paste the seed tasks.

2. **Setup Apps Script** – [docs/setup-apps-script.md](docs/setup-apps-script.md)  
   Deploy the Web App and create the 9 PM trigger.

3. **Run the app**
   - Copy `.env.example` to `.env.local` and add your GAS URL and token.
   - `npm install && npm run dev` → open [http://localhost:3000](http://localhost:3000).

4. **Deploy to Vercel** – [docs/deploy-vercel.md](docs/deploy-vercel.md)  
   Set env vars and deploy. Install on Android from the browser (Add to Home screen).

## Tech

- **Frontend**: Next.js 14 (App Router), TypeScript, no login.
- **Backend / DB**: Google Sheets + Google Apps Script (GET day, POST toggle, daily email).

No accounts, no analytics, minimal UI for low-end phones.
