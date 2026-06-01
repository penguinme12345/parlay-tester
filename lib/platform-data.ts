import { teams } from "@/lib/nba-data";

export const leagueSnapshot = [
  { label: "Games Tonight", value: "8", detail: "Main slate", tone: "blue" },
  { label: "Top Pace Team", value: "Pacers", detail: "103.8 possessions", tone: "green" },
  { label: "Top Offensive Rating", value: "Celtics", detail: "121.4 ORTG", tone: "blue" },
  { label: "Top Defensive Rating", value: "Timberwolves", detail: "108.2 DRTG", tone: "green" },
  { label: "Most In-Form Player", value: "Brunson", detail: "+15% last 5", tone: "amber" },
  { label: "Most Consistent", value: "Jokic", detail: "91 consistency", tone: "slate" },
] as const;

export const playerTrends = [
  { player: "Jalen Brunson", team: "NYK", stat: "Points", last5: 31.2, season: 27.1, trend: 15, status: "Hot" },
  { player: "Victor Wembanyama", team: "SAS", stat: "Blocks", last5: 4.4, season: 3.8, trend: 16, status: "Hot" },
  { player: "Anthony Davis", team: "LAL", stat: "Rebounds", last5: 11.2, season: 13.1, trend: -15, status: "Cold" },
  { player: "Luka Doncic", team: "DAL", stat: "Threes", last5: 5.8, season: 4.1, trend: 41, status: "Hot" },
  { player: "Jayson Tatum", team: "BOS", stat: "Assists", last5: 3.8, season: 5.1, trend: -25, status: "Cold" },
];

export const bestMatchups = [
  { title: "Wembanyama vs Knicks", score: 9.1, reason: "Knicks rank 26th vs centers." },
  { title: "Brunson vs Spurs", score: 8.7, reason: "San Antonio allows high usage to lead guards." },
  { title: "Jokic vs Lakers", score: 8.4, reason: "Denver pace and passing edge remain favorable." },
];

export const consistentPlayers = [
  { player: "Nikola Jokic", metric: "Points + Rebounds", score: 94 },
  { player: "Jalen Brunson", metric: "Points", score: 88 },
  { player: "Karl-Anthony Towns", metric: "Rebounds", score: 82 },
];

export const upcomingGames = [
  "Knicks at Spurs",
  "Lakers at Celtics",
  "Mavericks at Nuggets",
  "Heat at Bucks",
];

export const teamProfiles = teams.map((team, index) => ({
  ...team,
  pace: 96.8 + (index % 9) * 0.9,
  offensiveRating: 110.4 + (index % 10) * 1.3,
  defensiveRating: 108.1 + (index % 11) * 1.1,
  netRating: -4.2 + (index % 12) * 0.9,
  winPct: 42 + (index % 12) * 4,
  homeRecord: `${18 + (index % 11)}-${7 + (index % 8)}`,
  awayRecord: `${13 + (index % 10)}-${10 + (index % 9)}`,
  positionDefense: {
    PG: 1 + ((index * 3) % 30),
    SG: 1 + ((index * 5) % 30),
    SF: 1 + ((index * 7) % 30),
    PF: 1 + ((index * 11) % 30),
    C: 1 + ((index * 13) % 30),
  },
}));

export const savedReports = [
  { id: "PD-1042", name: "Knicks scoring ladder", hitRate: 31, risk: 6.2, saved: true },
  { id: "PD-1038", name: "Spurs block angle", hitRate: 18, risk: 8.1, saved: false },
  { id: "PD-1029", name: "Lakers rebound build", hitRate: 26, risk: 7.0, saved: true },
];

export const correlationLabSeeds = [
  "Brunson 25+ Points",
  "Knicks Win",
  "Towns 10+ Rebounds",
  "Wembanyama 3+ Blocks",
];
