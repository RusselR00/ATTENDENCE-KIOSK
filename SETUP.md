# Setup & Deploy Guide — Attendance Kiosk

This runs entirely inside **your own Google account**. No hosting, no cost.
Total time: ~10 minutes. Do it once.

---

## 1. Create the Google Sheet

1. Go to [sheets.new](https://sheets.new) to create a blank spreadsheet.
2. Rename it something like **"Attendance"** (top-left).

## 2. Open the script editor

1. In the sheet, click **Extensions → Apps Script**.
2. A code editor opens in a new tab.

## 3. Paste the code

1. Delete whatever is in the default `Code.gs` file, then paste the full contents of **`Code.gs`** from this project.
2. Click the **+** next to *Files* → **HTML** → name it exactly **`index`** (no `.html`).
   Delete its default content and paste the full contents of **`index.html`** from this project.
3. Click the **Save** icon (💾).

## 4. Create the tabs

1. In the script editor, choose the function **`setupSheets`** from the dropdown at the top.
2. Click **Run**.
3. Google will ask you to **authorize** — approve it (choose your account → *Advanced* → *Go to (project)* → *Allow*). This is normal; it's your own script.
4. Go back to the sheet. You'll now see two tabs:
   - **Employees** — with example columns `Employee ID | Name | PIN | Active`
   - **Punches** — the log (fills automatically)

## 5. Add your employees

In the **Employees** tab, add one row per person:

| Employee ID | Name        | PIN  | Active |
|-------------|-------------|------|--------|
| E001        | Rahim Uddin | 4821 | Yes    |
| E002        | Karim Ali   | 7390 | Yes    |

- **PIN** = any 4 digits, private to that person.
- **Active** = `Yes` to allow punching, `No` to hide/disable someone.
- Delete the `Example Name` row when done.

## 6. Deploy as a Web App

1. In the script editor: **Deploy → New deployment**.
2. Click the gear ⚙️ → choose **Web app**.
3. Set:
   - **Execute as:** *Me (your account)*
   - **Who has access:** *Anyone with the link*
4. Click **Deploy** → authorize if asked → **copy the Web app URL**.

That URL is the app. Open it in any phone browser to test.

## 7. Put it on the phones

On each employee's phone (or the office phone):

1. Open the copied **Web app URL** in Chrome/Safari.
2. Allow **camera** access when asked.
3. **Add to Home Screen** (browser menu) → it now behaves like an app with its own icon.

---

## How your brother reviews attendance

- Open the **Punches** tab in the Sheet — every row is one punch:
  `Server Timestamp | Employee ID | Name | Type | Selfie Link | Status`
- Click a **Selfie Link** to see the stamped photo (also in the Drive folder **"Attendance Selfies"**).
- **Status** column:
  - `OPEN` — punched in, hasn't punched out yet.
  - `OK` — completed in/out pair.
  - `MISSING PUNCH-OUT` — forgot to punch out last time (correct the time manually).
  - `ORPHAN OUT` — a punch-out with no matching punch-in (review).
- Filter/sort by Name or Date, or **File → Download → Excel** to export.

## What proves what

| Check | Proves |
|-------|--------|
| PIN | Who it is |
| Live camera (no gallery uploads) | It's really them, taken now |
| Server timestamp in the Sheet | The real time (device clock can't fake it) |
| Stamp burned on the photo + office background | When & where — reviewed by eye |

> **Note:** location is verified by looking at the office background in the photo — it's a strong deterrent for a small team, not an airtight lock. If you ever need a bulletproof location guarantee, switch to a single fixed office phone (kiosk) instead of personal phones.

## Updating the app later

If you change `Code.gs` or `index.html`: paste the new code, Save, then
**Deploy → Manage deployments → edit (pencil) → Version: New version → Deploy**.
The same URL keeps working.
