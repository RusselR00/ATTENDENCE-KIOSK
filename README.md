# ATTENDENCE-KIOSK

A free, no-hosting employee **punch in / punch out** system built on **Google Apps Script + Google Sheets**.

Employees open one web app link on their phone, pick their name, enter a 4-digit PIN, take a **live selfie** (stamped with date/time/name/In-Out), and punch in or out. Records land in a Google Sheet; selfies land in a Drive folder — all inside the owner's Google account.

## Features

- **PIN** per employee — proves who is punching.
- **Live camera only** (no gallery uploads) — proves it's really them, taken now.
- **On-photo stamp** — date, time, name, and IN/OUT burned onto the selfie.
- **Server timestamp** recorded in the Sheet — the real time, unaffected by phone clocks.
- **Auto-flags missing punch-outs** so forgotten check-outs are easy to spot.
- **No GPS, no shifts dropdown, no third-party service, no cost.**

## Architecture

Two free pieces:

- **Apps Script + Google Sheet** — the data backend (a JSON API: employee list, PIN check, punch logging, selfies to Drive).
- **GitHub Pages** — hosts `index.html`, the phone screen. The live camera only works on a real web page, so the UI can't live inside Apps Script (Google blocks the camera in Apps Script iframes). The page calls the Apps Script API over `fetch`.

## Files

| File | What it is |
|------|-----------|
| `Code.gs` | Apps Script backend / JSON API (paste into the Sheet's script editor) |
| `index.html` | The phone screen (hosted on GitHub Pages) |
| `SETUP.md` | Step-by-step setup & deploy guide (~15 min) |
| `docs/superpowers/specs/` | Design spec |

## Quick start

See **[SETUP.md](SETUP.md)**: create a Sheet + paste `Code.gs`, run `setupSheets`, add employees, deploy as a Web App, put the `/exec` URL in `index.html`, and enable GitHub Pages.

## Location note

Location is verified by the **office background** visible in each selfie (reviewed by eye) — a strong deterrent for a small, trusted team, not an airtight lock. For a bulletproof location guarantee, run it on a single fixed office phone (kiosk) instead of personal phones.
