from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from parlay_doctor.models import LegResult, ParlayLeg


@dataclass(frozen=True)
class ParlayResult:
    games_tested: int
    parlay_hits: int
    hit_rate: float
    risk_label: str
    risk_score: int
    verdict: str
    weakest_leg: LegResult | None
    leg_results: list[LegResult]
    game_results: pd.DataFrame


def analyze_parlay(legs: list[ParlayLeg], game_logs: dict[str, pd.DataFrame]) -> ParlayResult:
    if not legs:
        return _empty_result()

    normalized_logs = {leg.key: _normalize_log(game_logs.get(leg.key, pd.DataFrame())) for leg in legs}
    leg_results = [_analyze_leg(leg, normalized_logs[leg.key]) for leg in legs]
    game_results = _build_game_results(legs, normalized_logs)

    games_tested = len(game_results)
    parlay_hits = int(game_results["parlay_hit"].sum()) if games_tested else 0
    hit_rate = (parlay_hits / games_tested) * 100 if games_tested else 0.0
    risk_label, risk_score, verdict = risk_assessment(hit_rate)
    weakest_leg = min(leg_results, key=lambda result: result.success_rate) if leg_results else None

    return ParlayResult(
        games_tested=games_tested,
        parlay_hits=parlay_hits,
        hit_rate=hit_rate,
        risk_label=risk_label,
        risk_score=risk_score,
        verdict=verdict,
        weakest_leg=weakest_leg,
        leg_results=leg_results,
        game_results=game_results,
    )


def risk_assessment(hit_rate: float) -> tuple[str, int, str]:
    if hit_rate > 35:
        return "Low", 3, "This parlay has cleared at a stronger historical rate than most multi-leg builds."
    if hit_rate >= 20:
        return "Medium", 6, "This parlay has a moderate historical hit rate, with meaningful failure risk."
    return "High", 8, "This parlay is difficult to hit historically."


def _empty_result() -> ParlayResult:
    risk_label, risk_score, verdict = risk_assessment(0)
    return ParlayResult(
        games_tested=0,
        parlay_hits=0,
        hit_rate=0,
        risk_label=risk_label,
        risk_score=risk_score,
        verdict=verdict,
        weakest_leg=None,
        leg_results=[],
        game_results=pd.DataFrame(),
    )


def _normalize_log(log: pd.DataFrame) -> pd.DataFrame:
    if log.empty:
        return pd.DataFrame(columns=["GAME_DATE"])

    normalized = log.copy()
    normalized["GAME_DATE"] = pd.to_datetime(normalized["GAME_DATE"]).dt.date
    return normalized


def _analyze_leg(leg: ParlayLeg, log: pd.DataFrame) -> LegResult:
    if log.empty or leg.stat_column not in log.columns:
        return LegResult(leg=leg, games_tested=0, hits=0, success_rate=0.0)

    hits = int((pd.to_numeric(log[leg.stat_column], errors="coerce") >= leg.line).sum())
    games = len(log)
    success_rate = (hits / games) * 100 if games else 0.0
    return LegResult(leg=leg, games_tested=games, hits=hits, success_rate=success_rate)


def _build_game_results(legs: list[ParlayLeg], logs: dict[str, pd.DataFrame]) -> pd.DataFrame:
    per_leg = []
    for leg in legs:
        log = logs[leg.key]
        if log.empty or leg.stat_column not in log.columns:
            return pd.DataFrame(columns=["game_date", "parlay_hit"])

        frame = log[["GAME_DATE", leg.stat_column]].copy()
        frame.rename(columns={"GAME_DATE": "game_date", leg.stat_column: leg.key}, inplace=True)
        frame[leg.key] = pd.to_numeric(frame[leg.key], errors="coerce") >= leg.line
        per_leg.append(frame)

    merged = per_leg[0]
    for frame in per_leg[1:]:
        merged = merged.merge(frame, on="game_date", how="inner")

    if merged.empty:
        return pd.DataFrame(columns=["game_date", "parlay_hit"])

    leg_keys = [leg.key for leg in legs]
    merged["parlay_hit"] = merged[leg_keys].all(axis=1)
    merged = merged.sort_values("game_date", ascending=False)

    label_map = {leg.key: leg.label for leg in legs}
    merged.rename(columns=label_map, inplace=True)
    return merged.reset_index(drop=True)
