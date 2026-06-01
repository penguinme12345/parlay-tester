import {
  generatedHistoryForPlayer,
  getKnownPlayer,
  ParlayLeg,
  StatKey,
} from "@/lib/nba-data";

export type LegAnalysis = {
  leg: ParlayLeg;
  hitRate: number;
  hits: number;
  average: number;
  averageMargin: number;
  consistency: number;
  trend: "Hot" | "Neutral" | "Cold";
  recentTrend: number[];
};

export type AnalysisResult = {
  hitRate: number;
  riskScore: number;
  riskLabel: "Low" | "Medium" | "High";
  gamesAnalyzed: number;
  parlayHits: number;
  weakestLeg: LegAnalysis | null;
  synergyScore: number;
  confidenceScore: number;
  legBreakdown: LegAnalysis[];
  gameHits: boolean[];
};

export function analyzeLegs(legs: ParlayLeg[]): AnalysisResult {
  if (legs.length === 0) {
    return {
      hitRate: 0,
      riskScore: 0,
      riskLabel: "High",
      gamesAnalyzed: 0,
      parlayHits: 0,
      weakestLeg: null,
      synergyScore: 0,
      confidenceScore: 0,
      legBreakdown: [],
      gameHits: [],
    };
  }

  const gamesAnalyzed = Math.min(
    ...legs.map((leg) => getHistory(leg.playerId, leg.stat).length),
  );
  const legBreakdown = legs.map((leg) => analyzeSingleLeg(leg, gamesAnalyzed));
  const gameHits = Array.from({ length: gamesAnalyzed }, (_, gameIndex) =>
    legs.every((leg) => legHits(leg, gameIndex)),
  );
  const parlayHits = gameHits.filter(Boolean).length;
  const hitRate = round((parlayHits / gamesAnalyzed) * 100);
  const riskLabel = hitRate > 35 ? "Low" : hitRate >= 20 ? "Medium" : "High";
  const riskScore = Math.min(10, Math.max(1, Math.round(10 - hitRate / 10)));
  const weakestLeg = [...legBreakdown].sort((a, b) => a.hitRate - b.hitRate)[0] ?? null;
  const averageLegRate =
    legBreakdown.reduce((total, leg) => total + leg.hitRate, 0) / legBreakdown.length;
  const synergyScore = round(Math.max(0, 100 - Math.abs(averageLegRate - hitRate) * 1.2));
  const confidenceScore = round(Math.max(8, Math.min(94, hitRate * 0.72 + averageLegRate * 0.28)));

  return {
    hitRate,
    riskScore,
    riskLabel,
    gamesAnalyzed,
    parlayHits,
    weakestLeg,
    synergyScore,
    confidenceScore,
    legBreakdown,
    gameHits,
  };
}

export function analyzeSingleLeg(leg: ParlayLeg, gamesAnalyzed?: number): LegAnalysis {
  const values = getHistory(leg.playerId, leg.stat);
  const sample = values.slice(0, gamesAnalyzed ?? values.length);
  const margins = sample.map((value) =>
    leg.lineType === "Over" ? value - leg.line : leg.line - value,
  );
  const hits = margins.filter((margin) => margin >= 0).length;
  const average = round(sample.reduce((total, value) => total + value, 0) / sample.length);
  const hitRate = round((hits / sample.length) * 100);
  const averageMargin = round(margins.reduce((total, margin) => total + margin, 0) / margins.length);
  const consistency = round(Math.max(0, Math.min(100, hitRate - standardDeviation(margins) * 2)));
  const recentAverage = sample.slice(0, 3).reduce((total, value) => total + value, 0) / 3;
  const trend = recentAverage > average + 1 ? "Hot" : recentAverage < average - 1 ? "Cold" : "Neutral";

  return {
    leg,
    hitRate,
    hits,
    average,
    averageMargin,
    consistency,
    trend,
    recentTrend: sample.slice(0, 10),
  };
}

export function legHits(leg: ParlayLeg, gameIndex: number) {
  const value = getHistory(leg.playerId, leg.stat)[gameIndex] ?? 0;
  return leg.lineType === "Over" ? value >= leg.line : value <= leg.line;
}

function getHistory(playerId: string, stat: StatKey) {
  return getKnownPlayer(playerId)?.history[stat] ?? generatedHistoryForPlayer(playerId, stat);
}

function standardDeviation(values: number[]) {
  const average = values.reduce((total, value) => total + value, 0) / values.length;
  const variance =
    values.reduce((total, value) => total + Math.pow(value - average, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}
