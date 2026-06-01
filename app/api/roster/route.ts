import { NextRequest, NextResponse } from "next/server";

import { teams } from "@/lib/nba-data";

type NbaResultSet = {
  name: string;
  headers: string[];
  rowSet: Array<Array<string | number | null>>;
};

type NbaRosterResponse = {
  resultSets?: NbaResultSet[];
};

const NBA_HEADERS = {
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Connection: "keep-alive",
  Host: "stats.nba.com",
  Origin: "https://www.nba.com",
  Referer: "https://www.nba.com/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "x-nba-stats-origin": "stats",
  "x-nba-stats-token": "true",
};

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
      headers: NBA_HEADERS,
      next: { revalidate: 60 * 60 * 12 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `NBA roster request failed with ${response.status}.` },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as NbaRosterResponse;
    const commonTeamRoster = payload.resultSets?.find(
      (set) => set.name === "CommonTeamRoster",
    );

    if (!commonTeamRoster) {
      return NextResponse.json({ players: [] });
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

    return NextResponse.json({ players });
  } catch {
    return NextResponse.json(
      { error: "Could not reach stats.nba.com for roster data." },
      { status: 502 },
    );
  }
}

function rowToObject(headers: string[], row: Array<string | number | null>) {
  return Object.fromEntries(headers.map((header, index) => [header, row[index]]));
}
