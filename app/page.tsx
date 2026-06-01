"use client";

import {
  Activity,
  BarChart3,
  Brain,
  ChevronRight,
  Flame,
  History,
  Info,
  LineChart,
  Menu,
  Moon,
  Plus,
  Radar,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { analyzeLegs } from "@/lib/analysis";
import { getTeam, ParlayLeg, RosterPlayer, stats, teams } from "@/lib/nba-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SelectField } from "@/components/ui/select";
import { TabsNav } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Create Parlay", icon: Activity, active: true },
  { label: "Dashboard", icon: BarChart3 },
  { label: "History", icon: History },
  { label: "Players", icon: Users },
  { label: "Teams", icon: ShieldCheck },
  { label: "Matchups", icon: Radar },
  { label: "Trends", icon: TrendingUp },
  { label: "Settings", icon: Settings },
];

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "legs", label: "Leg Breakdown" },
  { value: "trends", label: "Trends" },
  { value: "matchup", label: "Matchup" },
  { value: "correlation", label: "Correlation" },
  { value: "what-if", label: "What-If" },
  { value: "context", label: "Game Context" },
  { value: "explanation", label: "Explanation" },
];

const featureHighlights = [
  { title: "Historical Hit Rates", icon: BarChart3 },
  { title: "Trend Analysis", icon: LineChart },
  { title: "Correlation Matrix", icon: Radar },
  { title: "Matchup Analysis", icon: ShieldCheck },
  { title: "Risk Assessment", icon: Flame },
];

const seasonOptions = ["2025-26", "2024-25", "2023-24", "2022-23", "2021-22"];

export default function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [stage, setStage] = useState<"build" | "results">("build");
  const [season, setSeason] = useState(seasonOptions[0]);
  const [teamId, setTeamId] = useState(teams[0].id);
  const [teamPlayers, setTeamPlayers] = useState<RosterPlayer[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [rosterStatus, setRosterStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [rosterError, setRosterError] = useState("");
  const [stat, setStat] = useState<(typeof stats)[number]>("Points");
  const [lineType, setLineType] = useState<"Over" | "Under">("Over");
  const [line, setLine] = useState(25.5);
  const [parlayType, setParlayType] = useState("and");
  const [legs, setLegs] = useState<ParlayLeg[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [whatIfLegs, setWhatIfLegs] = useState<ParlayLeg[]>([]);

  const analysis = useMemo(() => analyzeLegs(legs), [legs]);
  const whatIfAnalysis = useMemo(
    () => analyzeLegs(whatIfLegs.length ? whatIfLegs : legs),
    [legs, whatIfLegs],
  );

  useEffect(() => {
    const controller = new AbortController();
    setRosterStatus("loading");
    setRosterError("");
    setTeamPlayers([]);
    setPlayerId("");

    fetch(`/api/roster?teamId=${teamId}&season=${season}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          players?: RosterPlayer[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Roster request failed.");
        }

        const nextPlayers = payload.players ?? [];
        setTeamPlayers(nextPlayers);
        setPlayerId(nextPlayers[0]?.id ?? "");
        setRosterStatus("ready");
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) return;
        setRosterStatus("error");
        setRosterError(error.message);
      });

    return () => controller.abort();
  }, [teamId, season]);

  function handleSeasonChange(nextSeason: string) {
    setSeason(nextSeason);
    setLegs([]);
    setWhatIfLegs([]);
    setStage("build");
  }

  function handleTeamChange(nextTeamId: string) {
    setTeamId(nextTeamId);
  }

  function addLeg() {
    const selectedPlayer = teamPlayers.find((player) => player.id === playerId);
    if (!selectedPlayer) return;

    setLegs((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        teamId,
        playerId,
        playerName: selectedPlayer.name,
        position: selectedPlayer.position,
        stat,
        lineType,
        line,
      },
    ]);
  }

  function analyzeParlay() {
    setWhatIfLegs(legs);
    setStage("results");
    setActiveTab("overview");
  }

  const progressValue = stage === "results" ? 100 : legs.length ? 48 : 18;

  return (
    <main className="min-h-screen surface-grid">
      <div className="flex min-h-screen">
        <aside className="hidden w-[280px] shrink-0 border-r border-slate-800 bg-panel/88 p-4 backdrop-blur-xl lg:flex lg:flex-col">
          <SidebarContent season={season} onSeasonChange={handleSeasonChange} />
        </aside>

        {mobileNavOpen ? (
          <div className="fixed inset-0 z-50 bg-background/90 p-3 backdrop-blur lg:hidden">
            <Card className="h-full overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <LogoBlock />
                <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="h-[calc(100%-5rem)] p-4">
                <SidebarContent
                  compact
                  season={season}
                  onSeasonChange={handleSeasonChange}
                />
              </div>
            </Card>
          </div>
        ) : null}

        <section className="min-w-0 flex-1">
          <div className="mx-auto flex w-full max-w-[1660px] flex-col gap-6 p-4 sm:p-6 xl:p-8">
            <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <Button
                  className="mt-1 lg:hidden"
                  variant="secondary"
                  size="icon"
                  onClick={() => setMobileNavOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <div>
                  <Badge tone="blue" className="mb-3">
                    NBA {season} Regular Season
                  </Badge>
                  <h1 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                    Create Your Parlay
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                    Build your parlay by adding player props and game outcomes.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setHowItWorksOpen(true)}>
                  <Info className="h-4 w-4" />
                  How It Works
                </Button>
                <Button variant="secondary" size="icon" title="Theme toggle">
                  <Moon className="h-4 w-4" />
                </Button>
              </div>
            </header>

            <Card className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  {["Build Parlay", "Analyze", "Results"].map((step, index) => {
                    const active =
                      (stage === "build" && index === (legs.length ? 1 : 0)) ||
                      (stage === "results" && index === 2);
                    return (
                      <Badge key={step} tone={active ? "blue" : "slate"}>
                        {index + 1}. {step}
                      </Badge>
                    );
                  })}
                </div>
                <div className="w-full md:w-72">
                  <Progress value={progressValue} />
                </div>
              </div>
            </Card>

            {stage === "build" ? (
              <>
                <section className="grid gap-4 xl:grid-cols-[minmax(280px,0.9fr)_minmax(360px,1.2fr)_minmax(280px,0.9fr)]">
                  <AddLegCard
                    teamId={teamId}
                    playerId={playerId}
                    stat={stat}
                    lineType={lineType}
                    line={line}
                    teamPlayers={teamPlayers}
                    rosterStatus={rosterStatus}
                    rosterError={rosterError}
                    onTeamChange={handleTeamChange}
                    onPlayerChange={setPlayerId}
                    onStatChange={setStat}
                    onLineTypeChange={setLineType}
                    onLineChange={setLine}
                    onAdd={addLeg}
                  />
                  <CurrentParlayCard
                    legs={legs}
                    onRemove={(id) => setLegs((current) => current.filter((leg) => leg.id !== id))}
                    onClear={() => setLegs([])}
                    onFocusAdd={() => setStage("build")}
                  />
                  <PreviewCard
                    legs={legs}
                    parlayType={parlayType}
                    onParlayTypeChange={setParlayType}
                  />
                </section>

                <AnalyzeCta disabled={!legs.length} onAnalyze={analyzeParlay} />

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {featureHighlights.map((feature) => (
                    <Card key={feature.title} className="p-4">
                      <feature.icon className="mb-4 h-5 w-5 text-accent" />
                      <div className="text-sm font-semibold text-white">{feature.title}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-400">
                        Available in your post-analysis workspace.
                      </div>
                    </Card>
                  ))}
                </section>
              </>
            ) : (
              <ResultsView
                legs={legs}
                analysis={analysis}
                whatIfLegs={whatIfLegs}
                whatIfAnalysis={whatIfAnalysis}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onBack={() => setStage("build")}
                onWhatIfChange={setWhatIfLegs}
              />
            )}
          </div>
        </section>
      </div>

      {howItWorksOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>How It Works</CardTitle>
                <CardDescription>Build first, then analyze only when you are ready.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setHowItWorksOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-300">
              <p>Select a team, choose a player, set the stat and line, then add the leg.</p>
              <p>The results view starts with hit rate and risk, then reveals trends, matchup notes, correlation, and what-if controls in tabs.</p>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </main>
  );
}

function SidebarContent({
  compact = false,
  season,
  onSeasonChange,
}: {
  compact?: boolean;
  season: string;
  onSeasonChange: (season: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {!compact ? <LogoBlock /> : null}
      <nav className="mt-8 flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm font-semibold text-slate-400 transition hover:bg-slate-800/70 hover:text-white",
              item.active && "bg-primary/15 text-blue-100 ring-1 ring-blue-500/30 shadow-glow",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto space-y-4 pt-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-white text-xs font-black text-slate-950">
              NBA
            </div>
            <div>
              <div className="text-sm font-semibold text-white">NBA {season}</div>
              <div className="text-xs text-slate-400">Regular Season</div>
            </div>
          </div>
          <select
            value={season}
            onChange={(event) => onSeasonChange(event.target.value)}
            className="mt-4 h-10 w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 text-sm text-slate-200"
          >
            {seasonOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Card>
        <Card className="border-blue-500/30 bg-blue-950/20 p-4">
          <Sparkles className="mb-3 h-5 w-5 text-accent" />
          <div className="font-semibold text-white">Unlock Pro</div>
          <div className="mt-2 space-y-1 text-xs text-slate-300">
            <div>AI Analysis</div>
            <div>Correlation Engine</div>
            <div>Matchup Insights</div>
          </div>
          <Button className="mt-4 w-full" variant="primary" size="sm">
            Upgrade Now
          </Button>
        </Card>
      </div>
    </div>
  );
}

function LogoBlock() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary shadow-glow">
        <Activity className="h-5 w-5 text-white" />
      </div>
      <div>
        <div className="text-base font-semibold text-white">Parlay Doctor</div>
        <div className="text-xs text-slate-400">Analyze Smarter.</div>
      </div>
    </div>
  );
}

function AddLegCard({
  teamId,
  playerId,
  stat,
  lineType,
  line,
  teamPlayers,
  rosterStatus,
  rosterError,
  onTeamChange,
  onPlayerChange,
  onStatChange,
  onLineTypeChange,
  onLineChange,
  onAdd,
}: {
  teamId: string;
  playerId: string;
  stat: (typeof stats)[number];
  lineType: "Over" | "Under";
  line: number;
  teamPlayers: RosterPlayer[];
  rosterStatus: "idle" | "loading" | "ready" | "error";
  rosterError: string;
  onTeamChange: (value: string) => void;
  onPlayerChange: (value: string) => void;
  onStatChange: (value: (typeof stats)[number]) => void;
  onLineTypeChange: (value: "Over" | "Under") => void;
  onLineChange: (value: number) => void;
  onAdd: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Leg</CardTitle>
        <CardDescription>Team-first selection keeps player choices focused.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SelectField
          label="Team"
          value={teamId}
          options={teams.map((team) => ({
            value: team.id,
            label: `${team.code} ${team.name}`,
            helper: team.city,
          }))}
          onChange={onTeamChange}
        />
        <SelectField
          label="Player"
          value={playerId}
          options={teamPlayers.map((player) => ({
            value: player.id,
            label: player.name,
            helper: [player.position, player.jersey ? `#${player.jersey}` : ""]
              .filter(Boolean)
              .join(" "),
          }))}
          onChange={onPlayerChange}
          placeholder={
            rosterStatus === "loading"
              ? "Loading active roster..."
              : rosterStatus === "error"
                ? "Roster unavailable"
                : "Choose a player"
          }
          disabled={rosterStatus !== "ready" || !teamPlayers.length}
        />
        {rosterStatus === "error" ? (
          <div className="rounded-md border border-danger/40 bg-danger/10 p-3 text-xs leading-5 text-red-200">
            {rosterError}
          </div>
        ) : null}
        <SelectField
          label="Statistic"
          value={stat}
          options={stats.map((item) => ({ value: item, label: item }))}
          onChange={(value) => onStatChange(value as (typeof stats)[number])}
        />
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Line Type
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-800 bg-slate-950/50 p-1">
            {(["Over", "Under"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onLineTypeChange(type)}
                className={cn(
                  "h-10 rounded-md text-sm font-semibold text-slate-400 transition",
                  lineType === type && "bg-primary text-white shadow-glow",
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Line
          </div>
          <div className="grid grid-cols-[44px_1fr_44px] items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => onLineChange(Math.max(0.5, line - 0.5))}
            >
              -
            </Button>
            <div className="grid h-12 place-items-center rounded-md border border-slate-700 bg-slate-950/60 text-xl font-semibold text-white">
              {line.toFixed(1)}
            </div>
            <Button variant="secondary" size="icon" onClick={() => onLineChange(line + 0.5)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button
          className="w-full"
          variant="primary"
          size="lg"
          disabled={!playerId || rosterStatus !== "ready"}
          onClick={onAdd}
        >
          <Plus className="h-5 w-5" />
          Add Leg
        </Button>
      </CardContent>
    </Card>
  );
}

function CurrentParlayCard({
  legs,
  onRemove,
  onClear,
}: {
  legs: ParlayLeg[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onFocusAdd: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Current Parlay</CardTitle>
          <CardDescription>{legs.length || "No"} legs selected</CardDescription>
        </div>
        <Button variant="ghost" size="sm" disabled={!legs.length} onClick={onClear}>
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {legs.map((leg) => {
          const team = getTeam(leg.teamId);
          return (
            <div
              key={leg.id}
              className="rounded-lg border border-slate-800 bg-slate-950/42 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <TeamMark teamId={team.id} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">
                      {leg.playerName}
                    </div>
                    <div className="text-xs text-slate-400">
                      {team.code} • {leg.position || "POS"}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onRemove(leg.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-md bg-slate-900/70 p-3">
                  <div className="text-xs text-slate-500">Stat</div>
                  <div className="mt-1 font-semibold text-slate-100">{leg.stat}</div>
                </div>
                <div className="rounded-md bg-slate-900/70 p-3">
                  <div className="text-xs text-slate-500">Line</div>
                  <div className="mt-1 font-semibold text-slate-100">
                    {leg.lineType} {leg.line.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div className="grid min-h-28 place-items-center rounded-lg border border-dashed border-slate-700 bg-slate-950/24 p-4 text-center">
          <div>
            <Plus className="mx-auto mb-2 h-5 w-5 text-accent" />
            <div className="text-sm font-semibold text-white">Add Another Leg</div>
            <div className="mt-1 text-xs text-slate-400">Use the Add Leg card to keep building.</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PreviewCard({
  legs,
  parlayType,
  onParlayTypeChange,
}: {
  legs: ParlayLeg[];
  parlayType: string;
  onParlayTypeChange: (value: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Parlay Preview</CardTitle>
        <CardDescription>Confirmation before analytics.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SelectField
          label="Parlay Type"
          value={parlayType}
          options={[
            { value: "and", label: "All Must Hit (AND)" },
            { value: "any", label: "Any Can Hit", helper: "Future" },
          ]}
          onChange={onParlayTypeChange}
        />
        <div className="rounded-lg border border-blue-500/25 bg-blue-950/20 p-4">
          <div className="text-sm font-semibold text-blue-100">Summary</div>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {legs.length
              ? `${legs.length} legs selected. Every listed outcome must hit for this parlay to cash.`
              : "Add a leg to preview your parlay structure."}
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Zap className="h-4 w-4 text-warning" />
            Quick Tips
          </div>
          <div className="space-y-2 text-sm text-slate-400">
            <p>Use player trends.</p>
            <p>Check correlations.</p>
            <p>Consider rest days.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyzeCta({ disabled, onAnalyze }: { disabled: boolean; onAnalyze: () => void }) {
  return (
    <Card className="overflow-hidden border-blue-500/30 bg-blue-950/18">
      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xl font-semibold text-white">
            Ready to see how your parlay performs?
          </div>
          <div className="mt-1 text-sm text-slate-400">
            Run the historical analysis and open the results workspace.
          </div>
        </div>
        <Button variant="primary" size="lg" disabled={disabled} onClick={onAnalyze}>
          Analyze Parlay
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
}

function ResultsView({
  legs,
  analysis,
  whatIfLegs,
  whatIfAnalysis,
  activeTab,
  onTabChange,
  onBack,
  onWhatIfChange,
}: {
  legs: ParlayLeg[];
  analysis: ReturnType<typeof analyzeLegs>;
  whatIfLegs: ParlayLeg[];
  whatIfAnalysis: ReturnType<typeof analyzeLegs>;
  activeTab: string;
  onTabChange: (value: string) => void;
  onBack: () => void;
  onWhatIfChange: (legs: ParlayLeg[]) => void;
}) {
  const riskTone = analysis.riskLabel === "Low" ? "green" : analysis.riskLabel === "Medium" ? "amber" : "red";

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Results</h2>
          <p className="mt-1 text-sm text-slate-400">
            Hit rate first. Deep-dive analytics are available in tabs.
          </p>
        </div>
        <Button variant="secondary" onClick={onBack}>
          Back to Builder
        </Button>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard title="Historical Hit Rate" value={`${analysis.hitRate}%`} tone="blue" />
        <MetricCard title="Risk Score" value={`${analysis.riskScore}/10`} tone={riskTone} />
        <MetricCard
          title="Weakest Leg"
          value={analysis.weakestLeg ? analysis.weakestLeg.leg.playerName : "N/A"}
          tone="amber"
        />
        <MetricCard title="Synergy Score" value={`${analysis.synergyScore}%`} tone="green" />
        <MetricCard title="Games Analyzed" value={`${analysis.gamesAnalyzed}`} tone="slate" />
        <MetricCard title="Confidence Score" value={`${analysis.confidenceScore}%`} tone="blue" />
      </section>

      <Card>
        <CardContent className="space-y-5 pt-5">
          <TabsNav tabs={tabs} active={activeTab} onChange={onTabChange} />
          {activeTab === "overview" ? <OverviewTab analysis={analysis} /> : null}
          {activeTab === "legs" ? <LegBreakdownTab analysis={analysis} /> : null}
          {activeTab === "trends" ? <TrendsTab analysis={analysis} /> : null}
          {activeTab === "matchup" ? <MatchupTab /> : null}
          {activeTab === "correlation" ? <CorrelationTab legs={legs} analysis={analysis} /> : null}
          {activeTab === "what-if" ? (
            <WhatIfTab
              legs={whatIfLegs.length ? whatIfLegs : legs}
              analysis={whatIfAnalysis}
              onChange={onWhatIfChange}
            />
          ) : null}
          {activeTab === "context" ? <GameContextTab /> : null}
          {activeTab === "explanation" ? <ExplanationTab analysis={analysis} /> : null}
        </CardContent>
      </Card>
    </section>
  );
}

function MetricCard({ title, value, tone }: { title: string; value: string; tone: "blue" | "green" | "amber" | "red" | "slate" }) {
  return (
    <Card className="p-4">
      <Badge tone={tone}>{title}</Badge>
      <div className="mt-4 truncate text-2xl font-semibold text-white">{value}</div>
    </Card>
  );
}

function OverviewTab({ analysis }: { analysis: ReturnType<typeof analyzeLegs> }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="rounded-lg border border-slate-800 bg-slate-950/34 p-5">
        <div className="mb-2 text-lg font-semibold text-white">Plain-English Verdict</div>
        <p className="text-sm leading-7 text-slate-300">
          This parlay hit {analysis.parlayHits} times across {analysis.gamesAnalyzed} historical
          games in the sample. The current profile is {analysis.riskLabel.toLowerCase()} risk, led
          by a {analysis.hitRate}% historical hit rate.
        </p>
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-950/34 p-5">
        <div className="text-sm font-semibold text-white">Risk Summary</div>
        <Progress value={100 - analysis.riskScore * 9} className="mt-4" />
        <div className="mt-3 text-sm text-slate-400">
          Lower risk scores indicate stronger historical performance.
        </div>
      </div>
    </div>
  );
}

function LegBreakdownTab({ analysis }: { analysis: ReturnType<typeof analyzeLegs> }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-800">
      <div className="grid grid-cols-4 bg-slate-950/70 p-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <div>Leg</div>
        <div>Hit Rate</div>
        <div>Average Margin</div>
        <div>Consistency</div>
      </div>
      {analysis.legBreakdown.map((leg) => {
        return (
          <div
            key={leg.leg.id}
            className="grid grid-cols-4 border-t border-slate-800 p-3 text-sm text-slate-300"
          >
            <div className="min-w-0 truncate font-semibold text-white">
              {leg.leg.playerName} {leg.leg.lineType} {leg.leg.line.toFixed(1)} {leg.leg.stat}
            </div>
            <div>{leg.hitRate}%</div>
            <div>{leg.averageMargin > 0 ? "+" : ""}{leg.averageMargin}</div>
            <div>{leg.consistency}%</div>
          </div>
        );
      })}
    </div>
  );
}

function TrendsTab({ analysis }: { analysis: ReturnType<typeof analyzeLegs> }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {analysis.legBreakdown.map((leg) => {
        return (
          <div key={leg.leg.id} className="rounded-lg border border-slate-800 bg-slate-950/34 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0 truncate text-sm font-semibold text-white">
                {leg.leg.playerName}
              </div>
              <Badge tone="blue">Last 10</Badge>
            </div>
            <div className="flex h-28 items-end gap-2">
              {leg.recentTrend.map((value, index) => (
                <div
                  key={`${leg.leg.id}-${index}`}
                  className="flex-1 rounded-t bg-accent/80"
                  style={{ height: `${Math.max(12, Math.min(100, value * 2.4))}%` }}
                  title={`${value}`}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MatchupTab() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {["Position Defense", "Historical Performance", "Pace Environment"].map((item, index) => (
        <div key={item} className="rounded-lg border border-slate-800 bg-slate-950/34 p-5">
          <Badge tone={index === 0 ? "green" : index === 1 ? "blue" : "amber"}>{item}</Badge>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Matchup layer placeholder prepared for V2 data integration.
          </p>
        </div>
      ))}
    </div>
  );
}

function CorrelationTab({ legs, analysis }: { legs: ParlayLeg[]; analysis: ReturnType<typeof analyzeLegs> }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="rounded-lg border border-slate-800 bg-slate-950/34 p-4">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.max(1, legs.length)}, minmax(0, 1fr))` }}>
          {legs.map((leg, rowIndex) =>
            legs.map((otherLeg, colIndex) => {
              const strength = rowIndex === colIndex ? 92 : 44 + ((rowIndex + colIndex) % 4) * 11;
              return (
                <div
                  key={`${leg.id}-${otherLeg.id}`}
                  className="grid aspect-square place-items-center rounded-md text-xs font-semibold text-white"
                  style={{ backgroundColor: `rgba(59, 130, 246, ${strength / 100})` }}
                >
                  {strength}
                </div>
              );
            }),
          )}
        </div>
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-950/34 p-5">
        <div className="text-sm font-semibold text-white">Synergy Score</div>
        <div className="mt-4 text-4xl font-semibold text-white">{analysis.synergyScore}%</div>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Higher values suggest the leg set behaves more cohesively in the historical sample.
        </p>
      </div>
    </div>
  );
}

function WhatIfTab({
  legs,
  analysis,
  onChange,
}: {
  legs: ParlayLeg[];
  analysis: ReturnType<typeof analyzeLegs>;
  onChange: (legs: ParlayLeg[]) => void;
}) {
  return (
    <div className="space-y-4">
      <MetricCard title="Live What-If Hit Rate" value={`${analysis.hitRate}%`} tone="blue" />
      {legs.map((leg) => {
        return (
          <div key={leg.id} className="rounded-lg border border-slate-800 bg-slate-950/34 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0 truncate text-sm font-semibold text-white">
                {leg.playerName} {leg.stat}
              </div>
              <Badge tone="slate">{leg.line.toFixed(1)}</Badge>
            </div>
            <input
              type="range"
              min={0.5}
              max={50}
              step={0.5}
              value={leg.line}
              onChange={(event) =>
                onChange(
                  legs.map((item) =>
                    item.id === leg.id ? { ...item, line: Number(event.target.value) } : item,
                  ),
                )
              }
              className="w-full accent-blue-500"
            />
          </div>
        );
      })}
    </div>
  );
}

function GameContextTab() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {["Rest Days", "Home/Away", "Pace", "Defensive Rating"].map((item) => (
        <div key={item} className="rounded-lg border border-slate-800 bg-slate-950/34 p-5">
          <div className="text-sm font-semibold text-white">{item}</div>
          <div className="mt-4 h-2 rounded-full bg-slate-800">
            <div className="h-full w-2/3 rounded-full bg-accent" />
          </div>
          <div className="mt-3 text-xs text-slate-400">Prepared for historical context data.</div>
        </div>
      ))}
    </div>
  );
}

function ExplanationTab({ analysis }: { analysis: ReturnType<typeof analyzeLegs> }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/34 p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <Brain className="h-4 w-4 text-accent" />
        Narrative Explanation
      </div>
      <p className="text-sm leading-7 text-slate-300">
        The parlay is historically {analysis.riskLabel.toLowerCase()} risk because the full ticket
        hit {analysis.hitRate}% of tested games. The weakest leg deserves the most attention before
        increasing stake size or adding more legs.
      </p>
    </div>
  );
}

function TeamMark({ teamId }: { teamId: string }) {
  const team = getTeam(teamId);
  return (
    <div
      className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-xs font-black text-slate-950"
      style={{ backgroundColor: team.color }}
    >
      {team.code}
    </div>
  );
}
