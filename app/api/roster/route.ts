import { NextRequest, NextResponse } from "next/server";

import { fallbackRosterForTeam, teams } from "@/lib/nba-data";
import { NBA_STATS_HEADERS, NbaStatsResponse, rowToObject } from "@/lib/nba-stats-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId") ?? "";
  const season = searchParams.get("season") ?? "";

  if (!teams.some((team) => team.id === teamId)) {
    return NextResponse.json({ error: "Unknown NBA team." }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}$/.test(season)) {
    return NextResponse.json({ error: "Season must look like 2025-26." }, { status: 400 });
  }

  const url = new URL("https://stats.nba.com/stats/commonteamroster");
  url.searchParams.set("LeagueID", "00");
  url.searchParams.set("Season", season);
  url.searchParams.set("TeamID", teamId);

  try {
    const response = await fetch(url, {
      headers: NBA_STATS_HEADERS,
      next: { revalidate: 60 * 60 * 12 },
    });

    if (!response.ok) {
      return fallbackRosterResponse(teamId, `NBA roster request failed with ${response.status}.`);
    }

    const payload = (await response.json()) as NbaStatsResponse;
    const commonTeamRoster = payload.resultSets?.find(
      (set) => set.name === "CommonTeamRoster",
    );

    if (!commonTeamRoster) {
      return fallbackRosterResponse(teamId, "NBA roster payload did not include a roster.");
    }

    const players = commonTeamRoster.rowSet
      .map((row) => rowToObject(commonTeamRoster.headers, row))
      .map((player) => ({
        id: String(player.PLAYER_ID ?? player.PLAYERID ?? player.Person_ID),
        teamId,
        name: String(player.PLAYER ?? player.PLAYER_NAME ?? ""),
        position: String(player.POSITION ?? ""),
        jersey: String(player.NUM ?? ""),
      }))
      .filter((player) => player.id && player.name)
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ players, source: "nba_api" });
  } catch (error) {
    return fallbackRosterResponse(
      teamId,
      error instanceof Error ? error.message : "Could not reach stats.nba.com for roster data.",
    );
  }
}

function fallbackRosterResponse(teamId: string, warning: string) {
  return NextResponse.json({
    players: fallbackRosterForTeam(teamId),
    source: "fallback",
    warning,
  });
}
