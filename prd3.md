# Parlay Doctor V3 - Advanced Analytics Platform PRD

## Overview

Parlay Doctor V3 expands beyond parlay analysis.

The application becomes a complete NBA analytics platform built around historical performance, contextual analysis, trend discovery, correlation analysis, and predictive modeling.

The Create Parlay experience remains unchanged from V2.

All new functionality is integrated into the existing UI architecture.

No redesign required.

All pages use the existing:

* Dark Navy Theme
* shadcn/ui
* Sidebar Navigation
* Card-based layout
* Analytics-first design language

---

# Information Architecture

Sidebar Navigation

Create Parlay

Dashboard

History

Players

Teams

Matchups

Trends

Settings

Each page now serves a specific purpose.

---

# CREATE PARLAY

Purpose:

Construct and analyze parlays.

No changes from V2.5.

This remains the primary workflow.

Users arrive here first.

---

# DASHBOARD

Purpose:

Daily analytics home page.

Think Bloomberg Terminal for NBA props.

Displays:

Top Player Trends

Best Matchups

Most Consistent Players

Highest Correlations

League Overview

Upcoming Games

Recent Searches

---

## Dashboard Section 1

League Snapshot

Cards:

Games Tonight

Top Pace Team

Top Offensive Rating

Top Defensive Rating

Most In-Form Player

Most Consistent Player

---

## Dashboard Section 2

Top Trends

Display:

Hot Players

Cold Players

Trending Props

Example:

Brunson

Last 5:
31.2 PPG

Season:
27.1

Trend:
+15%

---

## Dashboard Section 3

Best Matchups Tonight

Example:

Wembanyama vs Knicks

Advantage Score:
9.1

Reason:

Knicks rank 26th vs Centers.

---

# PLAYERS PAGE

Purpose:

Player Research Center

This becomes one of the strongest pages.

---

## Search

Select Team

↓

Select Player

No typing required.

---

## Player Overview

Cards:

Season Average

Last 5

Last 10

Consistency Score

Minutes Average

Usage Rate

---

## Performance Charts

Points

Rebounds

Assists

Threes

Blocks

Steals

Use Recharts.

---

## Home vs Away Analysis

Display:

Home Average

Away Average

Difference

Impact Score

---

## Rest Day Analysis

Display:

Back-to-Back

1 Day Rest

2+ Days Rest

---

## Opponent Analysis

Display:

Performance against every NBA team.

Sortable table.

---

## Similar Game Engine

NEW

Purpose:

Find similar historical situations.

Input:

Opponent

Location

Rest Days

Recent Form

Output:

Most Similar Games

Result

Performance

---

# TEAMS PAGE

Purpose:

Team Analytics Center

---

## Team Profile

Display:

Pace

Offensive Rating

Defensive Rating

Net Rating

Win %

Home Record

Away Record

---

## Team Trends

Display:

Last 5

Last 10

Season

---

## Position Defense Rankings

One of the strongest features.

Example:

Knicks

vs PG:
4th

vs SG:
9th

vs SF:
14th

vs PF:
20th

vs C:
27th

---

## Team Correlations

Display:

Team Win ↔ Star Player Props

Example:

Knicks Win

↔ Brunson 25+

Correlation:
0.43

---

# MATCHUPS PAGE

Purpose:

Game Analysis

---

## Game Selector

Example:

Knicks vs Spurs

---

## Head-to-Head Dashboard

Displays:

Pace Comparison

Offensive Rating Comparison

Defensive Rating Comparison

Home/Away Effects

Position Matchups

---

## Matchup Advantage Scores

Every player receives:

1-10 score

Example:

Brunson

Advantage:
8.7

Reason:

Weak opposing PG defense.

---

## Injury Impact Engine

Displays:

How injuries affect projections.

Example:

Fox OUT

Impact:

Wembanyama

Points:
+2.8

Rebounds:
+1.3

Usage:
+5%

---

# TRENDS PAGE

Purpose:

Discover opportunities.

Think stock market screener.

---

## Hot Players

Players outperforming averages.

---

## Cold Players

Players underperforming averages.

---

## Biggest Movers

Last 3 vs Season

Last 5 vs Season

Last 10 vs Season

---

## Trend Strength Score

Formula:

Recent Average

vs

Season Average

Output:

0-100

---

## Breakout Detector

Example:

Player averaging:

15

18

21

24

Trend detected.

---

# HISTORY PAGE

Purpose:

Track user analysis history.

---

Displays:

Past Parlays

Past Reports

Risk Scores

Hit Rates

Saved Analysis

Favorites

---

## Compare Mode

Compare two previous parlays.

Example:

Parlay A

vs

Parlay B

---

# NEW FEATURE

CORRELATION LAB

Located under Dashboard.

---

Purpose:

Analyze relationships.

Input:

Brunson 25+

Knicks Win

Towns 10 Rebounds

---

Output:

Correlation Matrix

Synergy Score

Best Pair

Worst Pair

---

## Network Graph

Advanced visualization.

Display:

Nodes

Connections

Strength

This becomes a wow feature.

---

# NEW FEATURE

FAIR ODDS ENGINE

Integrated into analysis reports.

Purpose:

Compare sportsbook implied probability with historical probability.

Example:

Sportsbook

+450

Historical

18%

Fair Odds

+455

Difference

+1%

---

# NEW FEATURE

LINE DIFFICULTY SCORE

Every prop receives:

Easy

Moderate

Hard

Extreme

Based on:

Historical hit rates.

---

# NEW FEATURE

MINUTES PROJECTION ENGINE

Used everywhere.

Player Page

Matchup Page

Parlay Analysis

---

Display:

Expected Minutes

Confidence

Historical Range

---

# NEW FEATURE

USAGE ENGINE

Displays:

Season Usage

Recent Usage

Usage Change

Impact on projections.

---

# NEW FEATURE

PLAYOFF MODE

Global Toggle

Regular Season

Playoffs

Combined

Affects entire platform.

---

# NEW FEATURE

CONTEXT ENGINE

Used in every calculation.

Factors:

Opponent

Home/Away

Rest Days

Pace

Defensive Rating

Playoff Status

Injuries

Minutes Projection

Usage Projection

---

# FUTURE V4

Machine Learning Layer

Models:

Logistic Regression

XGBoost

Inputs:

Opponent Defense

Home/Away

Rest

Pace

Usage

Minutes

Injuries

Playoff Status

Recent Form

Output:

Probability Prop Hits

Probability Parlay Hits

Confidence Score

---

# Long-Term Vision

Parlay Doctor becomes:

Not a betting tool.

Not a parlay calculator.

A complete NBA analytics platform that helps users understand player performance, game context, trends, and risk through historical and predictive analysis.
