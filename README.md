# ClaimsBuddy

ClaimsBuddy is a UI-focused mockup for a simplified insurance claim process.

## What this demo includes

- Intro screen with:
  - System title (`ClaimsBuddy`)
  - End-to-end claim journey
  - Required documents list
- Multi-step claim submission form with a progress bar
- Post-submission status screen with lifecycle nodes:
  - Start Claim -> Claim Submitted -> Under Review -> Approved
  - Rejected as a separate state
- Auto-decision behavior:
  - Simple claims can be auto-approved or auto-rejected
  - Complex claims route to Under Review for manual decision
- Email templates and simulated sending for every state transition except Start Claim

## Tech

- Plain HTML, CSS, and JavaScript (no backend required for this demo)

## Run locally

Open `index.html` in your browser, or run a local static server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Project structure

- `index.html` - UI screens and structure
- `styles.css` - visual design, responsive layout, animations
- `script.js` - claim flow logic, progress bar, state transitions, email notifications

## GitHub push steps

If `gh` CLI is installed and authenticated:

```bash
git init
git add .
git commit -m "Initial ClaimsBuddy UI mockup"
gh repo create claimsbuddy --private --source=. --remote=origin --push
```

If `gh` is not available, create an empty GitHub repo from the web UI and then run:

```bash
git init
git add .
git commit -m "Initial ClaimsBuddy UI mockup"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```
