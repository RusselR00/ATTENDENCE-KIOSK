# Attendance Kiosk — Design Spec

**Date:** 2026-07-04
**Owner:** for a small business (~10 employees, ~3 shifts)
**Goal:** A simple, free employee punch in/out system employees use from their own phones, with proof-of-identity, proof-of-liveness, and manual proof-of-location, all recorded in the owner's Google account.

## Summary

A single-page web app built with **Google Apps Script**. Employees open one shared web app link on their own phones. To punch, they select their name, enter a PIN, take a live selfie (which is stamped with date/time/name/In-Out), and choose Punch In or Punch Out. Records go to a Google Sheet; selfies go to a Drive folder. Everything lives in the owner's Google account — no hosting, no database, no third-party service, no cost.

## Decisions (locked)

| Area | Decision |
|---|---|
| Devices | Employees' **own phones** (multi-device), one shared web app link |
| Identity | **4-digit PIN** per employee |
| Liveness | **Live camera only** (`getUserMedia`) — no gallery/file uploads possible |
| Location proof | **Manual/visual**: employee shows a recognizable office background; manager eyeballs it. **No GPS.** |
| Photo stamp | Burn **date + time + name + In/Out** onto the selfie image |
| Time integrity | Photo stamp uses phone clock (for eyeballing); **Sheet records server timestamp** as the authoritative time |
| Storage | **Google Sheet** (records) + **Google Drive folder** (selfies) |
| Review | Owner reviews/filters/exports in the Google Sheet; opens selfie links in Drive |
| Shifts | **Not tracked** — timestamps imply the shift |
| Missing punch-out | **Auto-detect & flag**: a new Punch In after an unclosed Punch In marks the old session `MISSING PUNCH-OUT` |

## Architecture

**Google Apps Script Web App** (HTTPS, served from the owner's account).

### Components

1. **Google Sheet** — the database, two tabs:
   - **`Employees`** (owner maintains): `Employee ID | Name | PIN | Active`
   - **`Punches`** (auto-filled log): `Server Timestamp | Employee ID | Name | Type (In/Out) | Selfie Link | Status`
   - `Status` values: `OPEN` (an In awaiting its Out), `OK` (closed correctly), `MISSING PUNCH-OUT` (forgotten Out, flagged), `ORPHAN OUT` (an Out with no open session).

2. **Drive folder** — stores each selfie as a JPEG (downscaled + stamped). Sheet stores a clickable link per punch.

3. **`Code.gs`** (backend):
   - `doGet()` — serves the kiosk HTML page.
   - `getEmployees()` — returns active employees' **ID + Name only** (never PINs) to build the name grid.
   - `getServerTime()` — returns authoritative server time for the on-photo stamp.
   - `submitPunch(employeeId, pin, type, selfieBase64)`:
     1. Validate `pin` against the `Employees` tab; reject on mismatch.
     2. Apply missing-punch-out logic (below).
     3. Save the stamped selfie to Drive; get its URL.
     4. Append a row to `Punches` with the **server timestamp**.
     5. Return a friendly confirmation (`"Punched IN at 9:03 AM"`).

4. **`index.html`** (frontend kiosk/phone screen):
   - Step 1: **name grid** (touch-friendly buttons for the 10 employees).
   - Step 2: **PIN keypad** (numeric, on-screen).
   - Step 3: **live camera** preview (front camera via `getUserMedia`); capture draws the frame to a `<canvas>` and **burns the stamp** (date, time, name, In/Out) onto it.
   - Step 4: **Punch In / Punch Out** buttons → submit → confirmation screen.
   - No `<input type=file>` anywhere, so gallery uploads are impossible.

### Missing punch-out logic

On each submit, look up the employee's most recent `Punches` row:

- **Punch In:**
  - If last row is an `OPEN` In → set that row's Status to `MISSING PUNCH-OUT`.
  - Insert new In row with Status `OPEN`.
- **Punch Out:**
  - If last row is an `OPEN` In → set it to `OK`, insert Out row with Status `OK`.
  - If last row is an Out / none → insert Out row with Status `ORPHAN OUT` (flagged for manager).

## Data flow

1. Phone loads the web app → `getEmployees()` populates the name grid; `getServerTime()` primes the clock.
2. Employee: name → PIN → live selfie (stamped on-canvas) → In/Out.
3. Frontend sends `{employeeId, pin, type, selfieBase64}` to `submitPunch`.
4. Backend validates PIN, runs missing-punch logic, saves selfie to Drive, appends server-timestamped row to Sheet.
5. Confirmation shown; app resets for the next person.

## Error handling

- **Wrong PIN** → clear message, no record written.
- **Camera blocked/denied** → instruct the employee to allow camera; cannot punch without a photo (by design).
- **No network** → show "try again"; nothing is written until the server confirms.
- **Inactive/unknown employee** → not shown in the grid; PIN for an inactive employee is rejected.

## Security / integrity notes

- **PIN** = identity gate. **Live camera** = liveness (no old photos). **Server timestamp** = trustworthy time. **Office background (manual review)** = location.
- This is a **deterrent-grade** system, not airtight: location is verified by a human glancing at backgrounds; a determined person could fake an office-looking background. A fixed office **kiosk** is the only true, unspoofable location guarantee — noted as a future upgrade if needed.
- The web app link + a valid PIN are all that's required to punch, so **PINs must be kept private** to each employee.

## Deliverables

1. `Code.gs` — Apps Script backend.
2. `index.html` — kiosk/phone UI with live camera + on-photo stamping.
3. **Setup & deploy guide** — create the Sheet (with the two tabs) and Drive folder, paste the code, deploy as a Web App ("execute as owner", "anyone with link"), and add the URL to phones' home screens.

> Note: The final deploy runs in the owner's Google account (script.google.com) — it cannot be automated from here. The guide gives click-by-click steps (~10 minutes).

## Out of scope (intentionally)

- Face **recognition** (using PIN + selfie instead).
- **GPS** geofencing (using manual background review instead).
- **Shift** dropdown (timestamps imply shifts).
- A separate admin **dashboard** (the Google Sheet is the dashboard).
