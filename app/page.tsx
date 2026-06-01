"use client";

import {
  Activity,
  BarChart3,
  Brain,
  ChevronRight,
  Flame,
  History,
  Info,
  LineChart as LineChartIcon,
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
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { analyzeLegs } from "@/lib/analysis";
import { getTeam, ParlayLeg, RosterPlayer, stats, teams } from "@/lib/nba-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformPage, PlatformPageView } from "@/components/platform-pages";
import { Progress } from "@/components/ui/progress";
import { SelectField } from "@/components/ui/select";
import { TabsNav } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Create Parlay", icon: Activity },
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
  { value: "matchup", label: "Matchups" },
  { value: "correlation", label: "Correlation" },
  { value: "what-if", label: "What If" },
  { value: "context", label: "Game Context" },
  { value: "explanation", label: "AI Analysis" },
];

const featureHighlights = [
  { title: "Historical Hit Rates", icon: BarChart3 },
  { title: "Trend Analysis", icon: LineChartIcon },
  { title: "Correlation Matrix", icon: Radar },
  { title: "Matchup Analysis", icon: ShieldCheck },
  { title: "Risk Assessment", icon: Flame },
];

const seasonOptions = ["2025-26", "2024-25", "2023-24", "2022-23", "2021-22"];
const analysisSteps = [
  "Checking Historical Performance",
  "Analyzing Player Trends",
  "Calculating Correlations",
  "Building Risk Model",
  "Generating Report",
];

export default function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [activePage, setActivePage] = useState<"Create Parlay" | PlatformPage>("Create Parlay");
  const [stage, setStage] = useState<"build" | "loading" | "results">("build");
  const [analysisStep, setAnalysisStep] = useState(0);
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
        const payload = await parseRosterPayload(response);

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
    setAnalysisStep(0);
    setStage("loading");
    setActiveTab("overview");

    analysisSteps.forEach((_, index) => {
      window.setTimeout(() => setAnalysisStep(index), index * 320);
    });
    window.setTimeout(() => setStage("results"), analysisSteps.length * 320 + 300);
  }

  const progressValue =
    stage === "results" ? 100 : stage === "loading" ? 72 : legs.length ? 48 : 18;

  return (
    <main className="min-h-screen surface-grid">
      <div className="flex min-h-screen">
        <aside className="hidden w-[280px] shrink-0 border-r border-slate-800 bg-panel/88 p-4 backdrop-blur-xl lg:flex lg:flex-col">
          <SidebarContent
            activePage={activePage}
            season={season}
            onNavigate={(page) => {
              setActivePage(page);
              setMobileNavOpen(false);
            }}
            onSeasonChange={handleSeasonChange}
          />
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
                  activePage={activePage}
                  season={season}
                  onNavigate={(page) => {
                    setActivePage(page);
                    setMobileNavOpen(false);
                  }}
                  onSeasonChange={handleSeasonChange}
                />
              </div>
            </Card>
          </div>
        ) : null}

        <section className="min-w-0 flex-1">
          <div className="mx-auto flex w-full max-w-[1660px] flex-col gap-6 p-4 sm:p-6 xl:p-8">
            {activePage === "Create Parlay" ? (
              <>
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
                      (stage === "loading" && index === 1) ||
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

            {stage === "build" ? (
              <>
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
            ) : null}

            {stage === "loading" ? <AnalysisLoading step={analysisStep} /> : null}

            {stage === "results" ? (
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
            ) : null}
              </>
            ) : (
              <PlatformPageView page={activePage} season={season} />
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

async function parseRosterPayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as {
      players?: RosterPlayer[];
      error?: string;
      warning?: string;
      source?: string;
    };
  }

  const text = await response.text();
  return {
    players: [],
    error: text || "Roster request returned a non-JSON response.",
  };
}

function SidebarContent({
  compact = false,
  activePage,
  onNavigate,
  season,
  onSeasonChange,
}: {
  compact?: boolean;
  activePage: "Create Parlay" | PlatformPage;
  onNavigate: (page: "Create Parlay" | PlatformPage) => void;
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
            type="button"
            onClick={() => onNavigate(item.label as "Create Parlay" | PlatformPage)}
            className={cn(
              "flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm font-semibold text-slate-400 transition hover:bg-slate-800/70 hover:text-white",
              activePage === item.label && "bg-primary/15 text-blue-100 ring-1 ring-blue-500/30 shadow-glow",
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

function AnalysisLoading({ step }: { step: number }) {
  const progress = ((step + 1) / analysisSteps.length) * 100;

  return (
    <Card className="overflow-hidden border-blue-500/30 bg-blue-950/16">
      <CardHeader>
        <CardTitle>Analyzing Parlay</CardTitle>
        <CardDescription>Building your scouting-style report.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Progress value={progress} />
        <div className="grid gap-3 md:grid-cols-5">
          {analysisSteps.map((label, index) => {
            const complete = index < step;
            const active = index === step;
            return (
              <div
                key={label}
                className={cn(
                  "rounded-lg border border-slate-800 bg-slate-950/40 p-4 transition",
                  active && "border-blue-400/60 bg-blue-950/30 shadow-glow",
                  complete && "border-green-400/35 bg-green-950/16",
                )}
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-sm font-semibold text-slate-300">
                  {complete ? "Done" : index + 1}
                </div>
                <div className="text-sm font-semibold leading-5 text-white">{label}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
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
  const riskTone =
    analysis.riskLabel === "Low" ? "green" : analysis.riskLabel === "Medium" ? "amber" : "red";

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Analysis Report</h2>
          <p className="mt-1 text-sm text-slate-400">
            Summary, diagnosis, deep dive, and recommended improvements.
          </p>
        </div>
        <Button variant="secondary" onClick={onBack}>
          Edit Parlay
        </Button>
      </div>

      <ExecutiveSummary analysis={analysis} riskTone={riskTone} />
      <DiagnosisCard analysis={analysis} riskTone={riskTone} />

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

      <RecommendationsSection analysis={analysis} />
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/45 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function ExecutiveSummary({
  analysis,
  riskTone,
}: {
  analysis: ReturnType<typeof analyzeLegs>;
  riskTone: "blue" | "green" | "amber" | "red" | "slate";
}) {
  const confidence =
    analysis.confidenceScore >= 70 ? "High" : analysis.confidenceScore >= 45 ? "Medium" : "Low";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Executive Summary</CardTitle>
        <CardDescription>Instant read on parlay quality.</CardDescription>
      </CardHeader>
      <CardContent>
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <MetricCard title="Historical Hit Rate" value={`${analysis.hitRate}%`} tone="blue" />
          <MetricCard title="Risk Score" value={`${analysis.riskScore}/10`} tone={riskTone} />
          <MetricCard
            title="Weakest Leg"
            value={analysis.weakestLeg ? shortLegLabel(analysis.weakestLeg.leg) : "N/A"}
            tone="amber"
          />
          <MetricCard title="Synergy Score" value={`${analysis.synergyScore}%`} tone="green" />
          <MetricCard title="Games Tested" value={`${analysis.gamesAnalyzed}`} tone="slate" />
          <MetricCard title="Confidence" value={confidence} tone="blue" />
        </section>
      </CardContent>
    </Card>
  );
}

function DiagnosisCard({
  analysis,
  riskTone,
}: {
  analysis: ReturnType<typeof analyzeLegs>;
  riskTone: "blue" | "green" | "amber" | "red" | "slate";
}) {
  const weakest = analysis.weakestLeg;
  const recommendation = weakest
    ? `${weakest.leg.lineType === "Over" ? "Lower" : "Raise"} ${weakest.leg.playerName}'s ${weakest.leg.stat} line by 1.0 to improve the historical profile.`
    : "Add at least one leg to generate a diagnosis.";

  return (
    <Card className="border-blue-500/25">
      <CardHeader>
        <CardTitle>Parlay Diagnosis</CardTitle>
        <CardDescription>Medical-style readout of the parlay's main risk.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            "rounded-lg border p-4",
            riskTone === "green" && "border-green-400/40 bg-green-950/16",
            riskTone === "amber" && "border-amber-400/40 bg-amber-950/16",
            riskTone === "red" && "border-red-400/40 bg-red-950/16",
          )}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={riskTone}>Status: {analysis.riskLabel} Risk</Badge>
            <Badge tone="slate">Primary Concern: {weakest ? shortLegLabel(weakest.leg) : "N/A"}</Badge>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {weakest
              ? `${shortLegLabel(weakest.leg)} has cleared the selected line in ${weakest.hitRate}% of analyzed games, making it the most dangerous leg in this ticket.`
              : "No diagnosis is available yet."}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-950/34 p-4">
            <div className="mb-3 text-sm font-semibold text-white">Positive Factors</div>
            <div className="space-y-2 text-sm text-slate-300">
              <p>Best leg hit rate: {Math.max(...analysis.legBreakdown.map((leg) => leg.hitRate))}%.</p>
              <p>Synergy score sits at {analysis.synergyScore}% across the current leg set.</p>
              <p>Recent form flags {analysis.legBreakdown.filter((leg) => leg.trend === "Hot").length} hot leg(s).</p>
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/34 p-4">
            <div className="mb-3 text-sm font-semibold text-white">Recommendation</div>
            <p className="text-sm leading-7 text-slate-300">{recommendation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewTab({ analysis }: { analysis: ReturnType<typeof analyzeLegs> }) {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <div className="rounded-lg border border-slate-800 bg-slate-950/34 p-5">
        <Badge tone="blue">Hit Rate</Badge>
        <div className="mt-4 text-3xl font-semibold text-white">{analysis.hitRate}%</div>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {analysis.parlayHits} hits in {analysis.gamesAnalyzed} tested games.
        </p>
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-950/34 p-5">
        <Badge tone={analysis.riskLabel === "High" ? "red" : analysis.riskLabel === "Medium" ? "amber" : "green"}>
          Risk
        </Badge>
        <div className="mt-4 text-3xl font-semibold text-white">{analysis.riskLabel}</div>
        <p className="mt-3 text-sm leading-6 text-slate-400">Risk score {analysis.riskScore}/10.</p>
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-950/34 p-5 lg:col-span-2">
        <Badge tone="slate">Key Insights</Badge>
        <p className="text-sm leading-7 text-slate-300">
          This parlay hit {analysis.parlayHits} times across {analysis.gamesAnalyzed} historical games
          in the sample. The current profile is {analysis.riskLabel.toLowerCase()} risk, with
          {analysis.weakestLeg ? ` ${shortLegLabel(analysis.weakestLeg.leg)} as the primary concern.` : " no weakest leg yet."}
        </p>
      </div>
    </div>
  );
}

function LegBreakdownTab({ analysis }: { analysis: ReturnType<typeof analyzeLegs> }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {analysis.legBreakdown.map((leg) => {
        const isWeakest = analysis.weakestLeg?.leg.id === leg.leg.id;
        return (
          <div
            key={leg.leg.id}
            className={cn(
              "rounded-lg border border-slate-800 bg-slate-950/34 p-5",
              isWeakest && "border-amber-400/45 bg-amber-950/12",
            )}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-semibold text-white">{shortLegLabel(leg.leg)}</div>
                <div className="mt-1 text-xs text-slate-400">{leg.leg.position || "Player prop"}</div>
              </div>
              {isWeakest ? <Badge tone="amber">Weakest Leg</Badge> : <Badge tone={trendTone(leg.trend)}>{leg.trend}</Badge>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <MiniStat label="Hit Rate" value={`${leg.hitRate}%`} />
              <MiniStat label="Average" value={`${leg.average}`} />
              <MiniStat label="Consistency" value={`${leg.consistency}%`} />
              <MiniStat label="Trend" value={leg.trend} />
              <MiniStat label="Margin Above Line" value={`${leg.averageMargin > 0 ? "+" : ""}${leg.averageMargin}`} />
            </div>
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
        const chartData = leg.recentTrend.map((value, index) => ({
          game: `G${index + 1}`,
          value,
          line: leg.leg.line,
        }));
        const last3 = average(leg.recentTrend.slice(0, 3));
        const last5 = average(leg.recentTrend.slice(0, 5));
        const last10 = average(leg.recentTrend);
        return (
          <div key={leg.leg.id} className="rounded-lg border border-slate-800 bg-slate-950/34 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0 truncate text-sm font-semibold text-white">
                {leg.leg.playerName}
              </div>
              <Badge tone={trendTone(leg.trend)}>{leg.trend}</Badge>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#1E293B" strokeDasharray="4 4" />
                  <XAxis dataKey="game" stroke="#64748B" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <ChartTooltip
                    contentStyle={{
                      background: "#0A1326",
                      border: "1px solid #1E293B",
                      borderRadius: 8,
                      color: "#E2E8F0",
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="line" stroke="#F59E0B" strokeWidth={2} dot={false} strokeDasharray="6 6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              <MiniStat label="Last 3" value={`${last3}`} />
              <MiniStat label="Last 5" value={`${last5}`} />
              <MiniStat label="Last 10" value={`${last10}`} />
              <MiniStat label="Season Avg" value={`${leg.average}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MatchupTab() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MatchupMetric title="Opponent Rank" value="26th" tone="green" detail="Soft positional matchup" />
      <MatchupMetric title="Defensive Rating" value="115.8" tone="amber" detail="Below league average" />
      <MatchupMetric title="Historical Avg" value="+2.4" tone="green" detail="Above selected lines" />
      <MatchupMetric title="Position Defense" value="Positive" tone="blue" detail="Model advantage" />
    </div>
  );
}

function MatchupMetric({
  title,
  value,
  tone,
  detail,
}: {
  title: string;
  value: string;
  tone: "blue" | "green" | "amber" | "red" | "slate";
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/34 p-5">
      <Badge tone={tone}>{title}</Badge>
      <div className="mt-4 text-3xl font-semibold text-white">{value}</div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{detail}</p>
    </div>
  );
}

function CorrelationTab({ legs, analysis }: { legs: ParlayLeg[]; analysis: ReturnType<typeof analyzeLegs> }) {
  const bestPair = legs.length > 1 ? `${legs[0].playerName} + ${legs[1].playerName}` : "Add another leg";
  const worstPair =
    legs.length > 2
      ? `${legs[0].playerName} + ${legs[legs.length - 1].playerName}`
      : "Not enough legs";

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
        <div className="mt-5 space-y-3">
          <MiniStat label="Best Pair" value={bestPair} />
          <MiniStat label="Worst Pair" value={worstPair} />
        </div>
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
    <div className="rounded-lg border border-blue-500/25 bg-blue-950/14 p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/20">
          <Brain className="h-5 w-5 text-accent" />
        </div>
        <div>
          <div className="text-base font-semibold text-white">Premium Report</div>
          <div className="text-xs text-slate-400">Human-readable analysis, no chat interface.</div>
        </div>
      </div>
      <div className="space-y-4 text-sm leading-7 text-slate-300">
        <p>
          This parlay has a historical hit rate of {analysis.hitRate}% across {analysis.gamesAnalyzed}
          analyzed games. The overall verdict is {analysis.riskLabel} Risk.
        </p>
        <p>
          {analysis.weakestLeg
            ? `${shortLegLabel(analysis.weakestLeg.leg)} is the largest source of risk, clearing the selected line in ${analysis.weakestLeg.hitRate}% of games.`
            : "No weakest leg has been identified yet."}
        </p>
        <p>
          The strongest path to improvement is reducing the difficulty of the weakest leg before
          adding more legs to the ticket.
        </p>
      </div>
    </div>
  );
}

function RecommendationsSection({ analysis }: { analysis: ReturnType<typeof analyzeLegs> }) {
  const weakest = analysis.weakestLeg;
  const suggestions = [
    weakest
      ? {
          title: `${weakest.leg.lineType === "Over" ? "Lower" : "Raise"} ${weakest.leg.playerName} ${weakest.leg.stat} line`,
          current: analysis.hitRate,
          projected: Math.min(92, analysis.hitRate + 13),
          impact: "+13%",
        }
      : null,
    weakest
      ? {
          title: `Remove ${weakest.leg.playerName}'s lowest-confidence leg`,
          current: analysis.hitRate,
          projected: Math.min(92, analysis.hitRate + 9),
          impact: "+9%",
        }
      : null,
    {
      title: "Reduce total leg count before adding new props",
      current: analysis.hitRate,
      projected: Math.min(92, analysis.hitRate + 6),
      impact: "+6%",
    },
  ].filter(Boolean) as Array<{ title: string; current: number; projected: number; impact: string }>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Improvements</CardTitle>
        <CardDescription>Actions that can improve the historical profile without leaving the page.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-3">
        {suggestions.map((suggestion) => (
          <div key={suggestion.title} className="rounded-lg border border-slate-800 bg-slate-950/34 p-5">
            <div className="text-sm font-semibold leading-6 text-white">{suggestion.title}</div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <MiniStat label="Current" value={`${suggestion.current}%`} />
              <MiniStat label="Suggested" value={`${suggestion.projected}%`} />
              <MiniStat label="Impact" value={suggestion.impact} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function shortLegLabel(leg: ParlayLeg) {
  return `${leg.playerName} ${leg.lineType} ${leg.line.toFixed(1)} ${leg.stat}`;
}

function trendTone(trend: "Hot" | "Neutral" | "Cold") {
  if (trend === "Hot") return "green";
  if (trend === "Cold") return "red";
  return "slate";
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round((values.reduce((total, value) => total + value, 0) / values.length) * 10) / 10;
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
