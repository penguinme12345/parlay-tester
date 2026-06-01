# Parlay Doctor V2 - UI/UX Overhaul PRD

## Overview

Parlay Doctor is an NBA parlay analysis platform that allows users to construct parlays and evaluate them using historical performance, trend analysis, matchup analysis, and correlation metrics.

This PRD focuses exclusively on the UI/UX redesign.

The goal is to transform the application from a statistics tool into a premium sports analytics product that feels intuitive, modern, and trustworthy.

Primary design language:

* Next.js
* Tailwind CSS
* shadcn/ui
* Lucide Icons
* Dark Navy Theme

The application should feel similar to:

* Linear
* Vercel
* Notion
* Stripe Dashboard

with sports-focused branding.

---

# Design Principles

## 1. Build First, Analyze Second

Users should never feel overwhelmed with analytics before they have built a parlay.

The interface should prioritize creation first.

Workflow:

Build → Review → Analyze → Deep Dive

---

## 2. Progressive Disclosure

Do not show advanced analytics immediately.

Show:

* hit rate
* risk
* summary

first.

Allow users to dive deeper into:

* trends
* correlations
* matchup analysis

through dedicated tabs.

---

## 3. Minimize Typing

Users should almost never type.

Everything should be:

* dropdown
* select
* search select
* button

driven.

---

## 4. Mobile Friendly

Desktop first.

Mobile optimized.

Every card should collapse cleanly.

No horizontal scrolling.

---

# Layout Structure

The application uses a 3-column layout.

```text
Sidebar
|
Main Content
|
Context Panel
```

---

# Sidebar

Width:

280px

Persistent on desktop.

Collapsible on mobile.

Purpose:

Global navigation.

Components:

* Logo
* Navigation
* Season Selector
* Premium Card

---

## Logo Section

Top left.

Display:

Parlay Doctor

Subheading:

Analyze Smarter.

Use:

* Activity icon
* Pulse icon
* Sports-inspired branding

---

## Navigation

shadcn:

* Button
* NavigationMenu

Items:

* Create Parlay
* Dashboard
* History
* Players
* Teams
* Matchups
* Trends
* Settings

Current page highlighted.

Blue accent glow.

---

## Season Selector

Bottom section.

Card containing:

* NBA logo
* Season dropdown

Example:

NBA 2025-26

Regular Season

---

## Premium Card

Display upgrade card.

Purpose:

Future monetization.

Features listed:

* AI Analysis
* Correlation Engine
* Matchup Insights

Button:

Upgrade Now

---

# Main Content Area

Main working area.

Contains:

1. Page Header
2. Workflow Progress Bar
3. Build Section
4. Review Section
5. CTA Section

---

# Page Header

Display:

Create Your Parlay

Subtitle:

Build your parlay by adding player props and game outcomes.

Top-right:

* How It Works button
* Theme toggle

shadcn:

* Button
* Tooltip

---

# Workflow Progress Bar

Horizontal stepper.

shadcn:

* Progress
* Badge

Steps:

1. Build Parlay
2. Analyze
3. Results

Only current step highlighted.

Purpose:

Reduce user uncertainty.

---

# Build Section

3-column card layout.

```text
Add Leg
|
Current Parlay
|
Parlay Preview
```

---

# Column 1: Add Leg

Purpose:

Create legs quickly.

Card component.

Width:

~30%

---

## Team Selector

FIRST FIELD

This is mandatory.

No player search field.

User selects:

Team

Examples:

* Knicks
* Spurs
* Lakers

Use:

shadcn Select

Include:

* Team logo
* Team name

---

## Player Selector

Only populated after team selection.

Examples:

Knicks selected

Dropdown becomes:

* Brunson
* Towns
* Hart
* Robinson

This dramatically reduces user effort.

---

## Statistic Selector

Options:

* Points
* Rebounds
* Assists
* Threes
* Blocks
* Steals

---

## Line Type

Toggle

Over

Under

Use:

shadcn ToggleGroup

---

## Line Input

Stepper

Minus button

Current Value

Plus button

No manual typing required.

---

## Add Leg Button

Large CTA.

Primary Blue.

Full width.

---

# Column 2: Current Parlay

Purpose:

Central workspace.

Users should spend most of their time here.

---

## Leg Cards

Each leg displayed as card.

Contents:

Team Logo

Player

Position

Stat

Line

Remove Button

Example:

Brunson

NYK • PG

Points

Over 25.5

---

## Add Another Leg

Dashed card.

Center aligned.

Acts as secondary CTA.

---

## Clear All

Top right.

Trash icon.

---

# Column 3: Parlay Preview

Purpose:

Quick summary.

Not analytics.

Just confirmation.

---

## Parlay Type

Dropdown.

Options:

* All Must Hit (AND)
* Any Can Hit (Future)

---

## Summary Box

Explains selected parlay type.

Simple language.

---

## Quick Tips

Educational card.

Examples:

Use player trends.

Check correlations.

Consider rest days.

---

# Analyze Section

Below build area.

Large horizontal CTA card.

Purpose:

Transition user from creation to analysis.

Display:

Ready to see how your parlay performs?

Button:

Analyze Parlay

This should be impossible to miss.

---

# Feature Highlights Row

Below CTA.

5 informational cards.

* Historical Hit Rates
* Trend Analysis
* Correlation Matrix
* Matchup Analysis
* Risk Assessment

Purpose:

Show value before user runs analysis.

---

# Results Page

After Analyze.

Replace creation screen.

---

# Top Summary Cards

Grid:

2 rows

Metrics:

* Historical Hit Rate
* Risk Score
* Weakest Leg
* Synergy Score
* Games Analyzed
* Confidence Score

Large typography.

Color coded.

---

# Deep Dive Tabs

shadcn Tabs

Tabs:

Overview

Leg Breakdown

Trends

Matchup

Correlation

What-If

Game Context

Explanation

---

## Overview

Summary.

Plain English verdict.

---

## Leg Breakdown

Every leg.

Hit rate.

Average margin.

Consistency score.

---

## Trends

Last:

3

5

10

Season

Charts.

---

## Matchup

Opponent analysis.

Position defense.

Historical performance.

---

## Correlation

Heatmap.

Correlation matrix.

Synergy score.

---

## What-If

Interactive slider.

Adjust lines.

See hit rate change live.

---

## Game Context

Rest days.

Home/Away.

Pace.

Defensive Rating.

---

## Explanation

AI generated narrative.

Explains:

Why parlay is strong or weak.

---

# Color System

Primary Background

#050B17

Secondary Background

#0A1326

Card Background

#111C34

Primary Blue

#2563EB

Accent Blue

#3B82F6

Success

#22C55E

Warning

#F59E0B

Danger

#EF4444

---

# Required shadcn Components

Button

Card

Badge

Tabs

Select

Combobox

ToggleGroup

Progress

Tooltip

Separator

Dialog

Sheet

Accordion

Skeleton

DropdownMenu

Table

ScrollArea

---

# Success Metrics

User can create a 3-leg parlay in under 20 seconds.

User never types a player name.

User understands hit rate within 5 seconds.

User reaches Analyze button without confusion.

UI feels like a premium SaaS product rather than a statistics dashboard.
