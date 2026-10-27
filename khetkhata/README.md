# KhetKhata — farm finance dashboard

A minimal, single-page web dashboard for smallholder farmers: crop-wise P&L,
break-even prices, udhaar (informal credit) ledger, labour & family book,
30/60/90-day cash-flow forecast, risk alerts, an AI profit coach (rule-based,
runs on the farmer's own ledger), credit-readiness report (print-to-PDF),
and consent-gated FPO / lender views.

No frameworks, no build step, no external requests — plain HTML/CSS/JS.
Everything runs in the browser; demo data lives in `localStorage`
(`Reset demo data` in Settings restores the seeded season).

## Structure

```
index.html        app shell (onboarding + dashboard)
css/app.css       all styling (print-friendly report styles included)
js/data.js        seeded demo season (edit to change the story)
js/i18n.js        English / हिंदी / Hinglish / मराठी
js/engine.js      P&L, break-even, cash-flow, alerts, coach, credit score
js/views.js       all screens
js/app.js         router, onboarding wizard, persistence
netlify.toml      Netlify config (publish dir, cache + security headers)
404.html          friendly not-found → /
```

## Deploy to Netlify

**Option A — drag & drop (fastest)**
1. Go to https://app.netlify.com/drop
2. Drag the `khetkhata` folder onto the page.
3. Done — you get a `*.netlify.app` URL immediately.

**Option B — Netlify CLI**
```bash
npm i -g netlify-cli
cd khetkhata
netlify deploy --prod --dir .
```

**Option C — Git (auto-deploy on push)**
1. Push this folder to a GitHub/GitLab repo.
2. Netlify → *Add new site → Import an existing project* → pick the repo.
3. Build command: *(leave empty)* — Publish directory: `.` (netlify.toml already sets this).

## Local development

Any static server works:
```bash
cd khetkhata
python -m http.server 8765
# → http://127.0.0.1:8765
```

Opening `index.html` directly from disk also works (no fetch calls).

## Notes

- Language defaults to **English**; हिंदी / Hinglish / मराठी via the `अ/A`
  button in the top bar or Settings.
- Use the **View as** dropdown (top right) to switch between farmer, FPO and
  lender dashboards.
- The credit report exports via the browser's *Print → Save as PDF*
  (print styles hide the app chrome automatically).
- WhatsApp / voice-note capture is intentionally stubbed: those need external
  services (WhatsApp Business API, speech-to-text) and are outside this demo.
