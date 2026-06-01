export type StatKey = "Points" | "Rebounds" | "Assists" | "Threes" | "Blocks" | "Steals";
export type LineType = "Over" | "Under";

export type Team = {
  id: string;
  name: string;
  city: string;
  code: string;
  color: string;
};

export type Player = {
  id: string;
  teamId: string;
  name: string;
  position: string;
  history: Record<StatKey, number[]>;
};

export type RosterPlayer = {
  id: string;
  teamId: string;
  name: string;
  position: string;
  jersey?: string;
};

export type ParlayLeg = {
  id: string;
  teamId: string;
  playerId: string;
  playerName: string;
  position: string;
  stat: StatKey;
  lineType: LineType;
  line: number;
};

export const teams: Team[] = [
  { id: "1610612737", name: "Hawks", city: "Atlanta", code: "ATL", color: "#E03A3E" },
  { id: "1610612738", name: "Celtics", city: "Boston", code: "BOS", color: "#22C55E" },
  { id: "1610612751", name: "Nets", city: "Brooklyn", code: "BKN", color: "#E5E7EB" },
  { id: "1610612766", name: "Hornets", city: "Charlotte", code: "CHA", color: "#22D3EE" },
  { id: "1610612741", name: "Bulls", city: "Chicago", code: "CHI", color: "#EF4444" },
  { id: "1610612739", name: "Cavaliers", city: "Cleveland", code: "CLE", color: "#F59E0B" },
  { id: "1610612742", name: "Mavericks", city: "Dallas", code: "DAL", color: "#38BDF8" },
  { id: "1610612743", name: "Nuggets", city: "Denver", code: "DEN", color: "#60A5FA" },
  { id: "1610612765", name: "Pistons", city: "Detroit", code: "DET", color: "#2563EB" },
  { id: "1610612744", name: "Warriors", city: "Golden State", code: "GSW", color: "#FACC15" },
  { id: "1610612745", name: "Rockets", city: "Houston", code: "HOU", color: "#EF4444" },
  { id: "1610612754", name: "Pacers", city: "Indiana", code: "IND", color: "#FBBF24" },
  { id: "1610612746", name: "Clippers", city: "LA", code: "LAC", color: "#60A5FA" },
  { id: "1610612747", name: "Lakers", city: "Los Angeles", code: "LAL", color: "#FACC15" },
  { id: "1610612763", name: "Grizzlies", city: "Memphis", code: "MEM", color: "#93C5FD" },
  { id: "1610612748", name: "Heat", city: "Miami", code: "MIA", color: "#F43F5E" },
  { id: "1610612749", name: "Bucks", city: "Milwaukee", code: "MIL", color: "#22C55E" },
  { id: "1610612750", name: "Timberwolves", city: "Minnesota", code: "MIN", color: "#67E8F9" },
  { id: "1610612740", name: "Pelicans", city: "New Orleans", code: "NOP", color: "#F97316" },
  { id: "1610612752", name: "Knicks", city: "New York", code: "NYK", color: "#F97316" },
  { id: "1610612760", name: "Thunder", city: "Oklahoma City", code: "OKC", color: "#38BDF8" },
  { id: "1610612753", name: "Magic", city: "Orlando", code: "ORL", color: "#60A5FA" },
  { id: "1610612755", name: "76ers", city: "Philadelphia", code: "PHI", color: "#2563EB" },
  { id: "1610612756", name: "Suns", city: "Phoenix", code: "PHX", color: "#F97316" },
  { id: "1610612757", name: "Trail Blazers", city: "Portland", code: "POR", color: "#EF4444" },
  { id: "1610612758", name: "Kings", city: "Sacramento", code: "SAC", color: "#A78BFA" },
  { id: "1610612759", name: "Spurs", city: "San Antonio", code: "SAS", color: "#CBD5E1" },
  { id: "1610612761", name: "Raptors", city: "Toronto", code: "TOR", color: "#EF4444" },
  { id: "1610612762", name: "Jazz", city: "Utah", code: "UTA", color: "#FACC15" },
  { id: "1610612764", name: "Wizards", city: "Washington", code: "WAS", color: "#60A5FA" },
];

const zeros = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

export const players: Player[] = [
  {
    id: "brunson",
    teamId: "1610612752",
    name: "Jalen Brunson",
    position: "PG",
    history: {
      Points: [31, 24, 28, 37, 21, 26, 33, 19, 29, 35, 27, 25],
      Rebounds: [4, 3, 5, 2, 4, 6, 3, 4, 5, 3, 2, 4],
      Assists: [8, 6, 9, 5, 7, 10, 6, 4, 8, 9, 5, 7],
      Threes: [3, 2, 4, 5, 1, 3, 4, 2, 3, 5, 2, 3],
      Blocks: zeros,
      Steals: [1, 0, 2, 1, 1, 3, 0, 1, 2, 1, 0, 1],
    },
  },
  {
    id: "towns",
    teamId: "1610612752",
    name: "Karl-Anthony Towns",
    position: "C",
    history: {
      Points: [22, 26, 18, 31, 24, 20, 28, 19, 25, 27, 23, 21],
      Rebounds: [12, 9, 13, 11, 8, 10, 14, 7, 12, 15, 10, 9],
      Assists: [3, 4, 2, 5, 4, 3, 6, 2, 4, 5, 3, 4],
      Threes: [2, 3, 1, 4, 2, 2, 5, 1, 3, 4, 2, 3],
      Blocks: [1, 2, 1, 0, 2, 1, 3, 1, 2, 2, 1, 0],
      Steals: [0, 1, 1, 0, 2, 1, 0, 1, 1, 2, 0, 1],
    },
  },
  {
    id: "hart",
    teamId: "1610612752",
    name: "Josh Hart",
    position: "SG",
    history: {
      Points: [14, 9, 18, 12, 16, 10, 13, 11, 15, 20, 8, 17],
      Rebounds: [10, 8, 11, 7, 12, 9, 10, 6, 13, 9, 8, 11],
      Assists: [5, 4, 6, 3, 7, 5, 4, 6, 8, 3, 5, 6],
      Threes: [2, 1, 3, 2, 2, 0, 1, 2, 3, 4, 1, 2],
      Blocks: zeros,
      Steals: [2, 1, 1, 0, 3, 2, 1, 1, 2, 2, 0, 1],
    },
  },
  {
    id: "wembanyama",
    teamId: "1610612759",
    name: "Victor Wembanyama",
    position: "C",
    history: {
      Points: [29, 21, 34, 27, 19, 31, 25, 22, 30, 36, 24, 28],
      Rebounds: [13, 10, 15, 12, 9, 14, 11, 16, 12, 18, 10, 13],
      Assists: [4, 3, 5, 2, 4, 6, 3, 5, 4, 7, 2, 4],
      Threes: [3, 1, 4, 2, 2, 5, 1, 3, 4, 4, 2, 3],
      Blocks: [4, 2, 6, 3, 5, 4, 2, 7, 3, 5, 1, 4],
      Steals: [1, 1, 2, 0, 1, 2, 1, 3, 0, 2, 1, 1],
    },
  },
  {
    id: "vassell",
    teamId: "1610612759",
    name: "Devin Vassell",
    position: "SG",
    history: {
      Points: [18, 24, 16, 21, 27, 19, 22, 14, 25, 20, 17, 23],
      Rebounds: [4, 5, 3, 4, 6, 2, 5, 4, 3, 6, 4, 5],
      Assists: [3, 5, 2, 4, 5, 3, 6, 2, 4, 5, 3, 4],
      Threes: [2, 4, 1, 3, 5, 2, 4, 1, 5, 3, 2, 4],
      Blocks: zeros,
      Steals: [1, 2, 0, 1, 2, 1, 1, 0, 2, 1, 1, 2],
    },
  },
  {
    id: "lebron",
    teamId: "1610612747",
    name: "LeBron James",
    position: "SF",
    history: {
      Points: [25, 29, 21, 33, 27, 24, 31, 19, 28, 35, 26, 22],
      Rebounds: [8, 7, 10, 6, 9, 8, 11, 7, 8, 12, 6, 9],
      Assists: [9, 11, 7, 8, 10, 6, 12, 9, 8, 13, 7, 10],
      Threes: [2, 3, 1, 4, 2, 3, 5, 1, 3, 4, 2, 2],
      Blocks: [1, 0, 1, 2, 1, 0, 1, 1, 2, 1, 0, 1],
      Steals: [1, 2, 1, 0, 2, 1, 3, 1, 2, 2, 1, 0],
    },
  },
  {
    id: "davis",
    teamId: "1610612747",
    name: "Anthony Davis",
    position: "PF",
    history: {
      Points: [28, 22, 31, 26, 19, 33, 25, 29, 24, 36, 21, 30],
      Rebounds: [14, 11, 16, 12, 9, 15, 13, 17, 10, 18, 12, 14],
      Assists: [3, 2, 4, 3, 5, 2, 4, 3, 2, 5, 3, 4],
      Threes: [1, 0, 2, 1, 1, 2, 0, 1, 1, 3, 0, 1],
      Blocks: [3, 2, 4, 2, 5, 3, 4, 1, 3, 5, 2, 4],
      Steals: [2, 1, 1, 0, 3, 2, 1, 1, 2, 2, 0, 1],
    },
  },
  {
    id: "tatum",
    teamId: "1610612738",
    name: "Jayson Tatum",
    position: "SF",
    history: {
      Points: [32, 27, 25, 39, 21, 30, 34, 24, 28, 37, 26, 31],
      Rebounds: [9, 8, 10, 7, 11, 8, 12, 6, 9, 10, 7, 8],
      Assists: [5, 4, 7, 3, 6, 5, 8, 4, 5, 7, 3, 6],
      Threes: [4, 3, 2, 6, 1, 4, 5, 2, 3, 6, 3, 4],
      Blocks: [1, 1, 0, 2, 1, 1, 0, 1, 2, 1, 0, 1],
      Steals: [1, 2, 1, 1, 3, 0, 2, 1, 2, 2, 1, 0],
    },
  },
  {
    id: "jokic",
    teamId: "1610612743",
    name: "Nikola Jokic",
    position: "C",
    history: {
      Points: [27, 31, 24, 35, 22, 29, 33, 26, 30, 38, 25, 28],
      Rebounds: [13, 12, 15, 10, 14, 11, 16, 9, 13, 18, 12, 15],
      Assists: [12, 9, 11, 14, 8, 10, 13, 7, 12, 15, 9, 11],
      Threes: [2, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2],
      Blocks: [1, 0, 1, 2, 1, 0, 1, 1, 2, 1, 0, 1],
      Steals: [2, 1, 1, 3, 0, 2, 1, 1, 2, 3, 1, 2],
    },
  },
  {
    id: "doncic",
    teamId: "1610612742",
    name: "Luka Doncic",
    position: "PG",
    history: {
      Points: [35, 29, 41, 33, 26, 38, 31, 28, 36, 44, 30, 34],
      Rebounds: [9, 8, 12, 10, 7, 11, 9, 8, 13, 10, 9, 12],
      Assists: [11, 9, 14, 8, 10, 13, 7, 12, 15, 9, 11, 10],
      Threes: [5, 3, 6, 4, 2, 7, 3, 4, 6, 8, 3, 5],
      Blocks: zeros,
      Steals: [1, 2, 1, 0, 3, 2, 1, 1, 2, 2, 0, 1],
    },
  },
];

export const stats: StatKey[] = ["Points", "Rebounds", "Assists", "Threes", "Blocks", "Steals"];

export function getTeam(id: string) {
  return teams.find((team) => team.id === id) ?? teams[0];
}

export function getPlayer(id: string) {
  return players.find((player) => player.id === id) ?? players[0];
}

export function getKnownPlayer(id: string) {
  return players.find((player) => player.id === id);
}

export function generatedHistoryForPlayer(playerId: string, stat: StatKey) {
  const statBase: Record<StatKey, number> = {
    Points: 18,
    Rebounds: 6,
    Assists: 5,
    Threes: 2,
    Blocks: 1,
    Steals: 1,
  };
  const seed = Array.from(playerId).reduce((total, char) => total + char.charCodeAt(0), 0);
  return Array.from({ length: 12 }, (_, index) => {
    const wave = ((seed + index * 7) % 11) - 5;
    return Math.max(0, statBase[stat] + wave + (index % 3));
  });
}
