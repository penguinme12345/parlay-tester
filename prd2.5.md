# Parlay Doctor V2.5 - Analysis Experience PRD

## Purpose

This PRD extends the existing "Parlay Doctor V2 - UI/UX Overhaul PRD".

The Create Parlay page and layout remain unchanged.

The focus of this document is the Analysis Experience that occurs after the user clicks:

Analyze Parlay

The goal is to transform raw statistics into a premium sports analytics experience while fully preserving the V2 dark navy shadcn aesthetic.

---

# Design Philosophy

The user should never feel like they are reading spreadsheets.

The user should feel like they are receiving a professional scouting report.

The application should answer:

1. How likely is this parlay to hit?
2. Why?
3. Which leg is dangerous?
4. What can I improve?

Everything else supports these goals.

---

# Existing UI Components To Keep

The following components remain unchanged:

Sidebar

Header

Build Parlay Flow

Add Leg Card

Parlay Card List

Parlay Preview

Analyze CTA

Dark Navy Theme

Season Selector

Premium Card

Workflow Stepper

These already work well and should remain visually identical.

---

# Analysis Loading Experience

Current State:

User clicks Analyze.

Future State:

Show a full analysis sequence.

Step 1

Checking Historical Performance

Step 2

Analyzing Player Trends

Step 3

Calculating Correlations

Step 4

Building Risk Model

Step 5

Generating Report

Use:

shadcn Progress

Animated Status Cards

Estimated duration:

1-3 seconds

Purpose:

Make analysis feel valuable.

---

# Results Page Architecture

After Analyze:

Replace the lower section of the page.

The top build section remains visible.

The results appear underneath.

Layout:

Summary Section

↓

Diagnosis Section

↓

Tabs Section

↓

Recommendations Section

---

# Section 1: Executive Summary

This is the first thing the user sees.

Full width card.

Contains:

Historical Hit Rate

Risk Score

Synergy Score

Weakest Leg

Games Tested

Confidence Score

Example:

Historical Hit Rate
18.4%

Risk Score
8.2 / 10

Weakest Leg
Wembanyama 3.5 Blocks

Games Tested
82

Confidence
High

Purpose:

Instant understanding.

No scrolling required.

---

# Section 2: Parlay Diagnosis

Most important feature in the product.

Large card.

Styled like a medical diagnosis.

Example:

Parlay Diagnosis

Status:
High Risk

Primary Concern:
Wembanyama 3.5 Blocks

This prop has only exceeded the selected line in 22% of analyzed games.

Positive Factors:

Brunson scoring correlates strongly with Knicks wins.

Recent player form is above season average.

Recommendation:

Consider lowering the blocks line to improve historical performance.

Color Coding:

Green

Yellow

Red

Use shadcn Alert component.

---

# Section 3: Deep Dive Tabs

Use shadcn Tabs.

Default Tab:

Overview

Tabs:

Overview

Leg Breakdown

Trends

Matchups

Correlation

What If

Game Context

AI Analysis

---

# Overview Tab

Purpose:

High level report.

Contains:

Hit Rate

Risk

Summary

Key Insights

Historical Record

No charts.

Only cards.

---

# Leg Breakdown Tab

Purpose:

Analyze every leg individually.

Each leg becomes a card.

Example:

Brunson Over 25.5 Points

Hit Rate:
54%

Average:
28.2

Consistency:
8.4

Trend:
Hot

Margin Above Line:
+2.7

Display weakest leg badge when applicable.

---

# Trends Tab

Purpose:

Recent performance.

Charts:

Last 3 Games

Last 5 Games

Last 10 Games

Season Average

Use:

Recharts

shadcn Card

Example:

Brunson scoring trend line.

Display:

Hot

Neutral

Cold

---

# Matchup Tab

Purpose:

Opponent-specific analysis.

Display:

Opponent Rank

Defensive Rating

Player Historical Average vs Opponent

Position Defense Rank

Example:

Knicks vs Centers

Rank:
26th

Advantage:
Positive

---

# Correlation Tab

Purpose:

Show interaction between legs.

Sections:

Correlation Matrix

Synergy Score

Best Pair

Worst Pair

Example:

Brunson Points ↔ Knicks Win

+0.43

Strong Positive

Use:

Heatmap

Gradient colors

Dark blue theme.

---

# What If Tab

Purpose:

Interactive experimentation.

Feature:

Line Slider

User adjusts:

25.5

26.5

27.5

28.5

Instantly updates:

Hit Rate

Risk Score

Example:

Current:
18%

Move line down:

31%

Purpose:

Increase engagement.

---

# Game Context Tab

Purpose:

Provide situational analysis.

Display:

Home vs Away

Rest Days

Back-To-Back

Pace

Team Offensive Rating

Team Defensive Rating

Example:

Brunson

Home:
29.4

Away:
24.8

Current:
Home

Adjustment:
Positive

---

# AI Analysis Tab

Purpose:

Human-readable report.

Example:

This parlay has a historical hit rate of 18.4%.

Brunson is currently averaging 31.4 points over his last five games and has exceeded this line in 54% of analyzed games.

The largest source of risk is Wembanyama's blocks prop, which has only hit in 22% of games.

Overall verdict:
High Risk.

Display in premium report format.

No chat interface.

No AI assistant.

Just a polished report.

---

# Section 4: Recommended Improvements

Bottom of page.

Automatically generated suggestions.

Examples:

Lower Wembanyama Blocks to 2.5

Replace Towns 12+ Rebounds with 10+ Rebounds

Remove lowest synergy leg

Add Knicks Moneyline

Each suggestion:

Current Hit Rate

Projected Hit Rate

Impact

Example:

Current:
18%

Suggested:
31%

Increase:
+13%

---

# Mobile Layout

Desktop:

Current V2 layout remains.

Tablet:

Right column stacks underneath.

Mobile:

Single column.

Build Section

↓

Current Parlay

↓

Preview

↓

Analyze

↓

Results

Maintain all cards.

No horizontal scroll.

---

# Additional shadcn Components

Tabs

Alert

Progress

Skeleton

Tooltip

HoverCard

Accordion

Badge

Chart Container

ScrollArea

Separator

---

# Success Criteria

User understands parlay quality within 5 seconds.

User identifies weakest leg immediately.

User can improve a parlay without leaving the page.

Results feel like a premium sports analytics report.

Application resembles a professional SaaS platform rather than a betting calculator.
