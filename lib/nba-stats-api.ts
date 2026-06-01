export const NBA_STATS_HEADERS = {
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

export type NbaResultSet = {
  name: string;
  headers: string[];
  rowSet: Array<Array<string | number | null>>;
};

export type NbaStatsResponse = {
  resultSets?: NbaResultSet[];
};

export function rowToObject(headers: string[], row: Array<string | number | null>) {
  return Object.fromEntries(headers.map((header, index) => [header, row[index]]));
}
