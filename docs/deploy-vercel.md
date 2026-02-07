# Deploy to Vercel

Get the Chores Tracker PWA running on Vercel and installable on an Android phone.

## 1. Prerequisites

- Node.js 18+ on your computer.
- A Vercel account ([vercel.com](https://vercel.com)).
- The **Chores Tracker** Google Sheet set up and the **Apps Script Web App** deployed (see [setup-google-sheet.md](setup-google-sheet.md) and [setup-apps-script.md](setup-apps-script.md)).

## 2. Build and run locally (optional)

```bash
cd "Chore Tracker"
npm install
```

Add a file **`.env.local`** in the project root:

```env
NEXT_PUBLIC_GAS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
NEXT_PUBLIC_API_TOKEN=your-secret-token-from-settings-tab
```

Replace `YOUR_SCRIPT_ID` and `your-secret-token-from-settings-tab` with your real Web App URL and SETTINGS token.

Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see “Chores Today” and today’s tasks (if the sheet and GAS are set up).

## 3. Deploy to Vercel

### Option A: Vercel dashboard (recommended for beginners)

1. Push your project to **GitHub** (create a repo and push the **Chore Tracker** folder).
2. Go to [vercel.com](https://vercel.com) and sign in.
3. Click **Add New** → **Project**.
4. Import the GitHub repo that contains **Chore Tracker**.
5. Set **Root Directory** to the folder that has `package.json` (e.g. `Chore Tracker` if the repo root is that folder).
6. In **Environment Variables**, add:

   **For Supabase (recommended – faster sync):**

   | Name                          | Value                    |
   |-------------------------------|--------------------------|
   | NEXT_PUBLIC_SUPABASE_URL      | Supabase Project URL     |
   | SUPABASE_SERVICE_ROLE_KEY     | Supabase service_role key|

   **Or for Google Sheets / GAS:**

   | Name                     | Value                                              |
   |--------------------------|----------------------------------------------------|
   | NEXT_PUBLIC_GAS_URL      | `https://script.google.com/macros/s/XXXX/exec`    |
   | NEXT_PUBLIC_API_TOKEN    | same token as in the sheet SETTINGS tab            |

   If both Supabase and GAS are set, the app uses **Supabase** for loading tasks and toggles. Add vars for **Production**, and optionally for **Preview**.
7. Click **Deploy**. Wait for the build to finish.

### Option B: Vercel CLI

```bash
npm i -g vercel
cd "Chore Tracker"
vercel
```

When asked, set **Environment Variables**:

- `NEXT_PUBLIC_GAS_URL` = your GAS Web App URL (e.g. `https://script.google.com/macros/s/XXXX/exec`).
- `NEXT_PUBLIC_API_TOKEN` = your SETTINGS token.

You can also add them later in the Vercel project **Settings** → **Environment Variables**.

## 4. Env vars summary

**Using Supabase (recommended):**

| Variable                      | Where it comes from              |
|-------------------------------|----------------------------------|
| NEXT_PUBLIC_SUPABASE_URL      | Supabase **Settings** → API → Project URL |
| SUPABASE_SERVICE_ROLE_KEY     | Supabase **Settings** → API → service_role key |

**Using Google Sheets / GAS:**

| Variable                   | Where it comes from                    |
|----------------------------|----------------------------------------|
| NEXT_PUBLIC_GAS_URL        | Apps Script **Deploy** → Web app URL   |
| NEXT_PUBLIC_API_TOKEN      | Sheet **SETTINGS** tab → row `token`   |

You need either the Supabase pair or the GAS pair. If both are set, Supabase is used.

## 5. Install on Android (PWA)

1. On the Android phone, open **Chrome** (or another browser that supports “Add to Home screen”).
2. Go to your Vercel URL (e.g. `https://your-project.vercel.app`).
3. Open the browser menu (⋮) → **Add to Home screen** or **Install app**.
4. Confirm. An icon appears on the home screen; opening it runs the app in standalone mode (big text, full screen, no browser bar).

## 6. After deployment

- To change tasks or schedules: edit the **TASKS** tab in the sheet.
- To change report emails: edit **recipients** in the **SETTINGS** tab.
- To change the API token: update **token** in SETTINGS and **NEXT_PUBLIC_API_TOKEN** in Vercel, then redeploy or wait for the next build so the new value is used.
