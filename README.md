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

## Files

| File | What it is |
|------|-----------|
| `Code.gs` | Apps Script backend (paste into the Sheet's script editor) |
| `index.html` | The phone/kiosk screen (paste as an HTML file named `index`) |
| `SETUP.md` | Step-by-step setup & deploy guide (~10 min) |
| `docs/superpowers/specs/` | Design spec |

## Quick start

See **[SETUP.md](SETUP.md)** — create a Sheet, paste the two files, run `setupSheets`, add employees, and Deploy as a Web App.

## Location note

Location is verified by the **office background** visible in each selfie (reviewed by eye) — a strong deterrent for a small, trusted team, not an airtight lock. For a bulletproof location guarantee, run it on a single fixed office phone (kiosk) instead of personal phones.
