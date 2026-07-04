# Setup & Deploy Guide — Attendance Kiosk

Two free pieces, both under your own accounts:

1. **Apps Script + Google Sheet** — stores the data (the backend).
2. **GitHub Pages** — hosts the phone screen `index.html` (the camera only works on a real
   web page, not inside Apps Script).

Total time: ~15 minutes.

---

## PART A — The backend (Google Sheet + Apps Script)

### 1. Create the Google Sheet
1. Go to [sheets.new](https://sheets.new) → rename it **"Attendance"**.
2. Click **Extensions → Apps Script**.

### 2. Paste the backend code
1. Delete everything in the default `Code.gs`, then paste the full contents of **`Code.gs`** from this project.
2. Click **Save** (💾).
   *(You do NOT need to add an HTML file anymore — the screen lives on GitHub Pages.)*

### 3. Create the tabs
1. Click **`Code.gs`** in the left Files list so the **Run** toolbar appears.
2. In the function dropdown pick **`setupSheets`** → click **▷ Run**.
3. Authorize when asked (*Advanced → Go to project → Allow*). It's your own script.
4. Back in the Sheet you'll see two tabs: **Employees** and **Punches**.

### 4. Add your employees
In the **Employees** tab:

| Employee ID | Name        | PIN  | Active |
|-------------|-------------|------|--------|
| E001        | Rahim Uddin | 4821 | Yes    |
| E002        | Karim Ali   | 7390 | Yes    |

Delete the `Example Name` row. `Active = No` disables/hides someone.

### 5. Deploy as a Web App (the API)
- **Deploy → New deployment** → gear ⚙️ → **Web app**
- **Execute as:** *Me* · **Who has access:** *Anyone with the link*
- **Deploy** → copy the **`/exec` URL**.

> **Already deployed once?** Don't make a new deployment — that changes the URL.
> Instead: **Deploy → Manage deployments → ✏️ edit → Version: New version → Deploy.**
> This publishes the new API code on the **same** `/exec` URL.

---

## PART B — The phone screen (GitHub Pages)

### 6. Point the screen at your backend
Open **`index.html`** and check the line near the top of the `<script>`:

```js
var API_URL = 'https://script.google.com/macros/s/…/exec';
```

It's already set to your current `/exec` URL. If your URL ever changes, paste the new one here,
then commit and push.

### 7. Turn on GitHub Pages
1. On GitHub, open the repo → **Settings → Pages**.
2. **Source:** *Deploy from a branch* → **Branch:** `main` → **Folder:** `/ (root)` → **Save**.
3. Wait ~1 minute. GitHub shows your live URL, e.g.
   **`https://russelr00.github.io/ATTENDENCE-KIOSK/`**

That URL is the app. Open it on a phone.

### 8. Put it on the phones
1. Open the **GitHub Pages URL** in **Chrome (Android)** or **Safari (iPhone)**.
   *(Not inside WhatsApp/Instagram browsers — they block the camera.)*
2. Allow **camera** when prompted.
3. **Add to Home Screen** → it behaves like an app.

---

## Testing (do this once)
1. Open the Pages URL → tap your name → enter PIN → **Punch IN** → allow camera → take photo.
2. Check the **Punches** tab: a new row appears with a selfie link and status `OPEN`.
3. Open the selfie link — the photo has **name + IN + date/time** stamped on it.
4. **Punch OUT** → the earlier row's status becomes `OK`.

## Reviewing attendance
Open the **Punches** tab:
`Server Timestamp | Employee ID | Name | Type | Selfie Link | Status`

- `OPEN` — punched in, not out yet.
- `OK` — completed in/out pair.
- `MISSING PUNCH-OUT` — forgot to punch out last time (correct the time by hand).
- `ORPHAN OUT` — a punch-out with no matching punch-in.

Selfies also live in the Drive folder **"Attendance Selfies"**.
Export anytime with **File → Download → Excel**.

## What proves what
| Check | Proves |
|-------|--------|
| PIN | Who it is |
| Live camera (GitHub Pages) | It's really them, taken now — no gallery uploads |
| Server timestamp in the Sheet | The real time (phone clock can't fake it) |
| Stamp on the photo + office background | When & where — reviewed by eye |

> Location is verified by looking at the office background in the photo — a strong deterrent
> for a small team, not airtight. For a bulletproof lock, use one fixed office phone (kiosk).

## Note on the public endpoint
Because the repo is public, your `/exec` URL is visible in `index.html`. That's acceptable:
recording a punch still requires a valid **PIN**, and PINs are never exposed. Keep PINs private
to each employee.
