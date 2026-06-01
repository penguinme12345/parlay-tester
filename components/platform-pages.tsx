"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BarChart3,
  GitBranch,
  History,
  LineChart as LineChartIcon,
  Radar,
  Search,
  Settings,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectField } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  bestMatchups,
  consistentPlayers,
  correlationLabSeeds,
  playerTrends,
  savedReports,
  upcomingGames,
} from "@/lib/platform-data";
import { generatedHistoryForPlayer, RosterPlayer, stats, teams } from "@/lib/nba-data";

export type PlatformPage = "Dashboard" | "History" | "Players" | "Teams" | "Matchups" | "Trends" | "Settings";

type TeamStats = {
  id: string;
  name: string;
  city: string;
  code: string;
  color: string;
  gamesPlayed: number | null;
  wins: number | null;
  losses: number | null;
  winPct: number | null;
  points: number | null;
  rebounds: number | null;
  assists: number | null;
  offensiveRating: number | null;
  defensiveRating: number | null;
  netRating: number | null;
  pace: number | null;
};

export function PlatformPageView({ page, season }: { page: PlatformPage; season: string }) {
  if (page === "Dashboard") return <DashboardPage season={season} />;
  if (page === "History") return <HistoryPage />;
  if (page === "Players") return <PlayersPage season={season} />;
  if (page === "Teams") return <TeamsPage season={season} />;
  if (page === "Matchups") return <MatchupsPage season={season} />;
  if (page === "Trends") return <TrendsPage season={season} />;
  return <SettingsPage season={season} />;
}

function DashboardPage({ season }: { season: string }) {
  const { stats: teamStats, status } = useTeamStats(season);
  const topPace = maxBy(teamStats, "pace");
  const topOffense = maxBy(teamStats, "offensiveRating");
  const topDefense = minBy(teamStats, "defensiveRating");
  const leagueSnapshot = [
    { label: "Games Tracked", value: formatNumber(sum(teamStats, "gamesPlayed")), detail: `${season} regular season`, tone: "blue" as const },
    { label: "Top Pace Team", value: topPace?.name ?? "Unavailable", detail: topPace?.pace != null ? `${topPace.pace.toFixed(1)} pace` : status, tone: "green" as const },
    { label: "Top Offensive Rating", value: topOffense?.name ?? "Unavailable", detail: topOffense?.offensiveRating != null ? `${topOffense.offensiveRating.toFixed(1)} ORTG` : status, tone: "blue" as const },
    { label: "Top Defensive Rating", value: topDefense?.name ?? "Unavailable", detail: topDefense?.defensiveRating != null ? `${topDefense.defensiveRating.toFixed(1)} DRTG` : status, tone: "green" as const },
    { label: "League Teams", value: teamStats.length ? String(teamStats.length) : "Unavailable", detail: "NBA Stats team rows", tone: "slate" as const },
    { label: "Data Source", value: status === "ready" ? "NBA Stats" : "Loading", detail: season, tone: "amber" as const },
  ];
  return (
    <section className="space-y-6">
      <PageTitle
        icon={BarChart3}
        title="Dashboard"
        subtitle="Daily NBA prop analytics home page."
      />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {leagueSnapshot.map((item) => (
          <MetricCard key={item.label} title={item.label} value={item.value} detail={item.detail} tone={item.tone} />
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Top Trends</CardTitle>
            <CardDescription>Hot players, cold players, and trending props.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {playerTrends.map((trend) => (
              <TrendRow key={`${trend.player}-${trend.stat}`} trend={trend} />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Best Matchups Tonight</CardTitle>
            <CardDescription>Opponent context and advantage scores.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bestMatchups.map((matchup) => (
              <div key={matchup.title} className="rounded-lg border border-slate-800 bg-slate-950/34 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-white">{matchup.title}</div>
                  <Badge tone="slate">Unavailable</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Requires schedule, opponent, and position-defense feeds for the selected season.
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Most Consistent Players</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {consistentPlayers.map((player) => (
              <div key={player.player} className="rounded-lg border border-slate-800 bg-slate-950/34 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{player.player}</div>
                    <div className="text-xs text-slate-400">{player.metric}</div>
                  </div>
                  <Badge tone="slate">Unavailable</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <CorrelationLab />
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Games</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingGames.map((game) => (
              <div key={game} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/34 p-4">
                <span className="text-sm font-semibold text-white">{game}</span>
                <Badge tone="slate">Tonight</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </section>
  );
}

async function parseRosterPayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as { players?: RosterPlayer[]; error?: string };
  }

  return {
    players: [],
    error: (await response.text()) || "Roster request returned a non-JSON response.",
  };
}

function PlayersPage({ season }: { season: string }) {
  const [teamId, setTeamId] = useState(teams[0].id);
  const [players, setPlayers] = useState<RosterPlayer[]>([]);
  const [playerId, setPlayerId] = useState("");
  const selectedPlayer = players.find((player) => player.id === playerId);

  useEffect(() => {
    let cancelled = false;
    setPlayers([]);
    setPlayerId("");
    fetch(`/api/roster?teamId=${teamId}&season=${season}`)
      .then(parseRosterPayload)
      .then((payload) => {
        if (cancelled) return;
        const nextPlayers = payload.players ?? [];
        setPlayers(nextPlayers);
        setPlayerId(nextPlayers[0]?.id ?? "");
      })
      .catch(() => {
        if (!cancelled) setPlayers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [teamId, season]);

  const chartData = stats.map((stat) => ({
    stat,
    last10: average(generatedHistoryForPlayer(playerId || "0", stat)),
    last5: average(generatedHistoryForPlayer(`${playerId || "0"}-recent`, stat).slice(0, 5)),
  }));

  return (
    <section className="space-y-6">
      <PageTitle icon={Users} title="Players" subtitle="Player research center with team-first selection." />
      <Card>
        <CardContent className="grid gap-4 pt-5 md:grid-cols-2">
          <SelectField
            label="Team"
            value={teamId}
            options={teams.map((team) => ({ value: team.id, label: `${team.code} ${team.name}`, helper: team.city }))}
            onChange={setTeamId}
          />
          <SelectField
            label="Player"
            value={playerId}
            options={players.map((player) => ({ value: player.id, label: player.name, helper: player.position }))}
            placeholder="Loading roster..."
            onChange={setPlayerId}
            disabled={!players.length}
          />
        </CardContent>
      </Card>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard title="Season Average" value="Unavailable" detail="Needs player game logs" tone="blue" />
        <MetricCard title="Last 5" value="Unavailable" detail="Needs player game logs" tone="green" />
        <MetricCard title="Last 10" value="Unavailable" detail="Needs player game logs" tone="blue" />
        <MetricCard title="Consistency" value="Unavailable" detail="Needs player game logs" tone="green" />
        <MetricCard title="Minutes Avg" value="Unavailable" detail="Needs box scores" tone="slate" />
        <MetricCard title="Usage Rate" value="Unavailable" detail="Needs usage feed" tone="amber" />
      </section>
      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>{selectedPlayer?.name ?? "Player"} Performance Charts</CardTitle>
            <CardDescription>Points, rebounds, assists, threes, blocks, and steals.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#1E293B" strokeDasharray="4 4" />
                <XAxis dataKey="stat" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <ChartTooltip contentStyle={tooltipStyle} />
                <Bar dataKey="last10" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="last5" fill="#22C55E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Context Engines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ContextRow label="Home Average" value="Unavailable" impact="Needs split logs" />
            <ContextRow label="Away Average" value="Unavailable" impact="Needs split logs" />
            <ContextRow label="Back-To-Back" value="Unavailable" impact="Needs rest-day model" />
            <ContextRow label="2+ Days Rest" value="Unavailable" impact="Needs rest-day model" />
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Similar Game Engine</CardTitle>
          <CardDescription>Opponent, location, rest, and recent form matched to historical situations.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {["vs Celtics, Home, 1 Day Rest", "vs Knicks, Away, B2B", "vs Nuggets, Home, Hot Form"].map((game, index) => (
            <div key={game} className="rounded-lg border border-slate-800 bg-slate-950/34 p-4">
              <Badge tone={index === 0 ? "green" : index === 1 ? "amber" : "blue"}>Similarity unavailable</Badge>
              <div className="mt-3 text-sm font-semibold text-white">{game}</div>
              <p className="mt-2 text-sm text-slate-400">Projected performance requires historical game-context logs.</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

function TeamsPage({ season }: { season: string }) {
  const { stats: teamStats, status, warning } = useTeamStats(season);
  const [teamId, setTeamId] = useState(teams[0].id);
  const selectedTeam = teams.find((team) => team.id === teamId) ?? teams[0];
  const profile = teamStats.find((team) => team.id === teamId);

  return (
    <section className="space-y-6">
      <PageTitle icon={ShieldCheck} title="Teams" subtitle={`Team analytics center for ${season}.`} />
      <Card>
        <CardContent className="pt-5">
          <SelectField
            label="Team"
            value={teamId}
            options={teams.map((team) => ({ value: team.id, label: `${team.code} ${team.name}`, helper: team.city }))}
            onChange={setTeamId}
          />
        </CardContent>
      </Card>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Pace" value={formatNullable(profile?.pace, 1)} detail="NBA Stats Advanced" tone="blue" />
        <MetricCard title="Offensive Rating" value={formatNullable(profile?.offensiveRating, 1)} detail="NBA Stats Advanced" tone="green" />
        <MetricCard title="Defensive Rating" value={formatNullable(profile?.defensiveRating, 1)} detail="NBA Stats Advanced" tone="amber" />
        <MetricCard title="Net Rating" value={formatNullable(profile?.netRating, 1)} detail={profile?.winPct != null ? `${(profile.winPct * 100).toFixed(1)}% win pct` : status} tone="slate" />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team Profile</CardTitle>
            <CardDescription>{selectedTeam.name} regular season results from NBA Stats.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ContextRow label="Record" value={profile ? `${profile.wins ?? "-"}-${profile.losses ?? "-"}` : "Unavailable"} impact={status} />
            <ContextRow label="Points Per Game" value={formatNullable(profile?.points, 1)} impact="NBA Stats" />
            <ContextRow label="Rebounds Per Game" value={formatNullable(profile?.rebounds, 1)} impact="NBA Stats" />
            <ContextRow label="Assists Per Game" value={formatNullable(profile?.assists, 1)} impact="NBA Stats" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Position Defense Rankings</CardTitle>
            <CardDescription>Hidden until opponent-by-position data is connected, so no fake ranks are shown.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ContextRow label="vs PG" value="Unavailable" impact="Needs matchup feed" />
            <ContextRow label="vs SG" value="Unavailable" impact="Needs matchup feed" />
            <ContextRow label="vs SF" value="Unavailable" impact="Needs matchup feed" />
            <ContextRow label="vs PF" value="Unavailable" impact="Needs matchup feed" />
            <ContextRow label="vs C" value="Unavailable" impact="Needs matchup feed" />
            {warning ? <p className="text-xs leading-5 text-amber-200">{warning}</p> : null}
          </CardContent>
        </Card>
      </section>
    </section>
  );
}

function MatchupsPage({ season }: { season: string }) {
  const { stats: teamStats, status } = useTeamStats(season);
  const [homeTeam, setHomeTeam] = useState("1610612752");
  const [awayTeam, setAwayTeam] = useState("1610612759");
  const home = teamStats.find((team) => team.id === homeTeam);
  const away = teamStats.find((team) => team.id === awayTeam);
  const homeMeta = teams.find((team) => team.id === homeTeam) ?? teams[0];
  const awayMeta = teams.find((team) => team.id === awayTeam) ?? teams[1];

  return (
    <section className="space-y-6">
      <PageTitle icon={Radar} title="Matchups" subtitle="Game analysis, advantage scores, and injury impact." />
      <Card>
        <CardContent className="grid gap-4 pt-5 md:grid-cols-2">
          <SelectField label="Home Team" value={homeTeam} options={teamOptions()} onChange={setHomeTeam} />
          <SelectField label="Away Team" value={awayTeam} options={teamOptions()} onChange={setAwayTeam} />
        </CardContent>
      </Card>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Pace Comparison" value={`${formatNullable(home?.pace, 1)} / ${formatNullable(away?.pace, 1)}`} detail="Home / Away" tone="blue" />
        <MetricCard title="Offense Edge" value={edgeLabel(home, away, "offensiveRating", "max") ?? "Unavailable"} detail={status} tone="green" />
        <MetricCard title="Defense Edge" value={edgeLabel(home, away, "defensiveRating", "min") ?? "Unavailable"} detail={status} tone="amber" />
        <MetricCard title="Selected Game" value={`${awayMeta.code} @ ${homeMeta.code}`} detail={season} tone="slate" />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Matchup Advantage Scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["Lead Guard", "Scoring Wing", "Primary Center"].map((role, index) => (
              <ContextRow key={role} label={role} value="Unavailable" impact="Needs position matchup model" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Injury Impact Engine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ContextRow label="Primary Ball Handler OUT" value="Unavailable" impact="Needs injury feed" />
            <ContextRow label="Starting Center Questionable" value="Unavailable" impact="Needs injury feed" />
            <ContextRow label="Bench Wing OUT" value="Unavailable" impact="Needs injury feed" />
          </CardContent>
        </Card>
      </section>
    </section>
  );
}

function TrendsPage({ season }: { season: string }) {
  return (
    <section className="space-y-6">
      <PageTitle icon={LineChartIcon} title="Trends" subtitle={`Opportunity discovery for ${season}.`} />
      <section className="grid gap-4 lg:grid-cols-3">
        <TrendPanel title="Hot Players" status="Hot" />
        <TrendPanel title="Cold Players" status="Cold" />
        <Card>
          <CardHeader>
            <CardTitle>Breakout Detector</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["15 → 18 → 21 → 24", "8 → 10 → 12 → 15", "2 → 3 → 4 → 6"].map((path, index) => (
              <ContextRow key={path} label={`Signal ${index + 1}`} value={path} impact="Trend detected" />
            ))}
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Trend Strength Score</CardTitle>
          <CardDescription>Recent average versus season average, scored 0-100.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-800 bg-slate-950/34 p-5 text-sm leading-6 text-slate-300">
            Trend scores are unavailable until player game logs are connected for {season}.
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function HistoryPage() {
  return (
    <section className="space-y-6">
      <PageTitle icon={History} title="History" subtitle="Past parlays, reports, favorites, and compare mode." />
      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Past Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {savedReports.map((report) => (
              <div key={report.id} className="rounded-lg border border-slate-800 bg-slate-950/34 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{report.name}</div>
                    <div className="text-xs text-slate-400">{report.id}</div>
                  </div>
                  <Badge tone="slate">Local sample</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MiniMetric label="Hit Rate" value="Unavailable" />
                  <MiniMetric label="Risk" value="Unavailable" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Compare Mode</CardTitle>
            <CardDescription>Compare two previous parlays.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MiniMetric label="Parlay A" value="Unavailable" />
            <MiniMetric label="Parlay B" value="Unavailable" />
            <Button className="w-full" variant="primary">Open Comparison</Button>
          </CardContent>
        </Card>
      </section>
    </section>
  );
}

function SettingsPage({ season }: { season: string }) {
  return (
    <section className="space-y-6">
      <PageTitle icon={Settings} title="Settings" subtitle={`Global platform controls for ${season}.`} />
      <Card>
        <CardHeader>
          <CardTitle>Playoff Mode</CardTitle>
          <CardDescription>Affects every platform calculation.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {["Regular Season", "Playoffs", "Combined"].map((mode, index) => (
            <button
              key={mode}
              className={cn(
                "rounded-lg border border-slate-800 bg-slate-950/34 p-4 text-left text-sm font-semibold text-slate-300",
                index === 0 && "border-blue-400/50 bg-blue-950/24 text-white shadow-glow",
              )}
            >
              {mode}
            </button>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Context Engine</CardTitle>
          <CardDescription>Factors used in every calculation.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          {["Opponent", "Home/Away", "Rest Days", "Pace", "Defensive Rating", "Injuries", "Minutes Projection", "Usage Projection"].map((factor) => (
            <Badge key={factor} tone="blue" className="justify-center">{factor}</Badge>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

function CorrelationLab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Correlation Lab</CardTitle>
        <CardDescription>Relationships, synergy, and network graph.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {correlationLabSeeds.map((seed) => (
            <Badge key={seed} tone="blue" className="h-auto justify-center py-2 text-center">{seed}</Badge>
          ))}
        </div>
        <div className="relative h-44 rounded-lg border border-slate-800 bg-slate-950/34">
          <NetworkNode className="left-[42%] top-[16%]" label="Brunson" />
          <NetworkNode className="left-[12%] top-[58%]" label="NYK" />
          <NetworkNode className="left-[67%] top-[58%]" label="Towns" />
          <div className="absolute left-[24%] top-[48%] h-px w-28 rotate-[-24deg] bg-blue-400/60" />
          <div className="absolute left-[51%] top-[48%] h-px w-28 rotate-[24deg] bg-green-400/60" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <MiniMetric label="Synergy" value="Unavailable" />
          <MiniMetric label="Best Pair" value="Unavailable" />
          <MiniMetric label="Worst Pair" value="Unavailable" />
        </div>
      </CardContent>
    </Card>
  );
}

function PageTitle({ icon: Icon, title, subtitle }: { icon: typeof Activity; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/20 text-accent">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <Badge tone="blue" className="mb-3">NBA Analytics Platform</Badge>
        <h1 className="text-3xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

function MetricCard({ title, value, detail, tone }: { title: string; value: string; detail: string; tone: "blue" | "green" | "amber" | "red" | "slate" }) {
  return (
    <Card className="p-4">
      <Badge tone={tone}>{title}</Badge>
      <div className="mt-4 truncate text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs text-slate-400">{detail}</div>
    </Card>
  );
}

function TrendRow({ trend }: { trend: (typeof playerTrends)[number] }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/34 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">{trend.player}</div>
          <div className="text-xs text-slate-400">{trend.team} • {trend.stat}</div>
        </div>
        <Badge tone="slate">Needs player logs</Badge>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniMetric label="Last 5" value="Unavailable" />
        <MiniMetric label="Season" value="Unavailable" />
        <MiniMetric label="Trend" value="Unavailable" />
      </div>
    </div>
  );
}

function TrendPanel({ title, status }: { title: string; status: "Hot" | "Cold" }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {playerTrends.filter((trend) => trend.status === status).map((trend) => (
          <TrendRow key={`${title}-${trend.player}`} trend={trend} />
        ))}
      </CardContent>
    </Card>
  );
}

function ContextRow({ label, value, impact }: { label: string; value: string; impact: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/34 p-4">
      <div>
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="mt-1 text-xs text-slate-400">{impact}</div>
      </div>
      <Badge tone={impact === "Risk" || impact === "Avoid" ? "red" : impact === "Neutral" ? "slate" : "green"}>{value}</Badge>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/45 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function NetworkNode({ className, label }: { className: string; label: string }) {
  return (
    <div className={cn("absolute z-10 grid h-14 w-14 place-items-center rounded-full border border-blue-400/50 bg-blue-950 text-[11px] font-semibold text-blue-100", className)}>
      {label}
    </div>
  );
}

function teamOptions() {
  return teams.map((team) => ({ value: team.id, label: `${team.code} ${team.name}`, helper: team.city }));
}

function useTeamStats(season: string) {
  const [stats, setStats] = useState<TeamStats[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const [warning, setWarning] = useState("");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setWarning("");

    fetch(`/api/team-stats?season=${season}`)
      .then(parseTeamStatsPayload)
      .then((payload) => {
        if (cancelled) return;
        setStats(payload.teams ?? []);
        setWarning(payload.warning ?? "");
        setStatus(payload.teams?.length ? "ready" : "unavailable");
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setStats([]);
        setWarning(error.message);
        setStatus("unavailable");
      });

    return () => {
      cancelled = true;
    };
  }, [season]);

  return { stats, status, warning };
}

async function parseTeamStatsPayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as {
      teams?: TeamStats[];
      warning?: string;
      source?: string;
    };
  }

  return {
    teams: [],
    warning: (await response.text()) || "Team stats request returned a non-JSON response.",
  };
}

function maxBy(stats: TeamStats[], key: keyof TeamStats) {
  return stats
    .filter((team) => typeof team[key] === "number")
    .sort((a, b) => Number(b[key]) - Number(a[key]))[0];
}

function minBy(stats: TeamStats[], key: keyof TeamStats) {
  return stats
    .filter((team) => typeof team[key] === "number")
    .sort((a, b) => Number(a[key]) - Number(b[key]))[0];
}

function sum(stats: TeamStats[], key: keyof TeamStats) {
  return stats.reduce((total, team) => total + (Number(team[key]) || 0), 0);
}

function formatNullable(value: number | null | undefined, digits = 0) {
  return value == null ? "Unavailable" : value.toFixed(digits);
}

function formatNumber(value: number) {
  return value ? new Intl.NumberFormat("en-US").format(value) : "Unavailable";
}

function edgeLabel(
  first: TeamStats | undefined,
  second: TeamStats | undefined,
  key: "offensiveRating" | "defensiveRating" | "pace",
  mode: "min" | "max",
) {
  if (!first || !second || first[key] == null || second[key] == null) return null;
  if (mode === "max") return first[key] >= second[key] ? first.code : second.code;
  return first[key] <= second[key] ? first.code : second.code;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round((values.reduce((total, value) => total + value, 0) / values.length) * 10) / 10;
}

function ordinal(value: number) {
  const suffix = value % 10 === 1 && value !== 11 ? "st" : value % 10 === 2 && value !== 12 ? "nd" : value % 10 === 3 && value !== 13 ? "rd" : "th";
  return `${value}${suffix}`;
}

const tooltipStyle = {
  background: "#0A1326",
  border: "1px solid #1E293B",
  borderRadius: 8,
  color: "#E2E8F0",
};
