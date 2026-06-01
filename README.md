# Parlay Doctor

Parlay Doctor is a Streamlit app for analyzing the historical hit rate of custom NBA player-prop parlays.

V1 focuses only on historical game logs from `nba_api`: no odds, no sportsbook integrations, no machine learning, and no betting recommendations.

The V2 UI in `prd.md` is implemented as a Next.js/Tailwind frontend with a premium dark workspace, team-first parlay creation, progressive analysis, and deep-dive tabs.

## Features

- Build a multi-leg NBA player prop parlay
- Analyze historical hit rate across common game dates
- See per-leg success rates
- Identify the weakest leg
- Get a simple Low / Medium / High risk assessment
- Cache NBA game logs locally in SQLite

## Setup

```powershell
python -m pip install -r requirements.txt
cmd /c npm install
```

## Run

V2 frontend:

```powershell
cmd /c npm run dev
```

V1 Streamlit prototype:

```powershell
streamlit run app.py
```

The app stores fetched game logs in `.cache/parlay_doctor.sqlite`.

## Test

```powershell
python -m pytest -q
cmd /c npm run build
```
