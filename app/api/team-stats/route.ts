import { NextRequest, NextResponse } from "next/server";

import { teams } from "@/lib/nba-data";
import { NBA_STATS_HEADERS, NbaStatsResponse, rowToObject } from "@/lib/nba-stats-api";

export const dynamic = "force-dynamic";

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const season = searchParams.get("season") ?? "";

  if (!/^\d{4}-\d{2}$/.test(season)) {
    return NextResponse.json({ error: "Season must look like 2024-25." }, { status: 400 });
  }

  try {
    const [baseRows, advancedRows] = await Promise.all([
      fetchLeagueDashTeamStats(season, "Base"),
      fetchLeagueDashTeamStats(season, "Advanced"),
    ]);
    const advancedByTeamId = new Map(advancedRows.map((row) => [String(row.TEAM_ID), row]));

    const stats: TeamStats[] = baseRows
      .map((base) => {
        const teamId = String(base.TEAM_ID);
        const team = teams.find((item) => item.id === teamId);
        const advanced = advancedByTeamId.get(teamId);

        if (!team) return null;

        return {
          id: team.id,
          name: team.name,
          city: team.city,
          code: team.code,
          color: team.color,
          gamesPlayed: numberOrNull(base.GP),
          wins: numberOrNull(base.W),
          losses: numberOrNull(base.L),
          winPct: numberOrNull(base.W_PCT),
          points: numberOrNull(base.PTS),
          rebounds: numberOrNull(base.REB),
          assists: numberOrNull(base.AST),
          offensiveRating: numberOrNull(advanced?.OFF_RATING),
          defensiveRating: numberOrNull(advanced?.DEF_RATING),
          netRating: numberOrNull(advanced?.NET_RATING),
          pace: numberOrNull(advanced?.PACE),
        };
      })
      .filter((team): team is TeamStats => team !== null)
      .sort((a, b) => a.code.localeCompare(b.code));

    return NextResponse.json({ teams: stats, season, source: "stats.nba.com" });
  } catch (error) {
    return NextResponse.json({
      teams: [],
      season,
      source: "unavailable",
      warning:
        error instanceof Error
          ? error.message
          : "Could not fetch team stats from stats.nba.com.",
    });
  }
}

async function fetchLeagueDashTeamStats(season: string, measureType: "Base" | "Advanced") {
  const url = new URL("https://stats.nba.com/stats/leaguedashteamstats");
  url.searchParams.set("Conference", "");
  url.searchParams.set("DateFrom", "");
  url.searchParams.set("DateTo", "");
  url.searchParams.set("Division", "");
  url.searchParams.set("GameSegment", "");
  url.searchParams.set("LastNGames", "0");
  url.searchParams.set("LeagueID", "00");
  url.searchParams.set("Location", "");
  url.searchParams.set("MeasureType", measureType);
  url.searchParams.set("Month", "0");
  url.searchParams.set("OpponentTeamID", "0");
  url.searchParams.set("Outcome", "");
  url.searchParams.set("PORound", "0");
  url.searchParams.set("PaceAdjust", "N");
  url.searchParams.set("PerMode", "PerGame");
  url.searchParams.set("Period", "0");
  url.searchParams.set("PlusMinus", "N");
  url.searchParams.set("Rank", "N");
  url.searchParams.set("Season", season);
  url.searchParams.set("SeasonSegment", "");
  url.searchParams.set("SeasonType", "Regular Season");
  url.searchParams.set("ShotClockRange", "");
  url.searchParams.set("StarterBench", "");
  url.searchParams.set("TeamID", "0");
  url.searchParams.set("TwoWay", "0");
  url.searchParams.set("VsConference", "");
  url.searchParams.set("VsDivision", "");

  const response = await fetch(url, {
    headers: NBA_STATS_HEADERS,
    next: { revalidate: 60 * 60 * 12 },
  });

  if (!response.ok) {
    throw new Error(`NBA team stats request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as NbaStatsResponse;
  const resultSet = payload.resultSets?.[0];
  if (!resultSet) {
    throw new Error("NBA team stats payload did not include result sets.");
  }

  return resultSet.rowSet.map((row) => rowToObject(resultSet.headers, row));
}

function numberOrNull(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
