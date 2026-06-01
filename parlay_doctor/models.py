from __future__ import annotations

from dataclasses import dataclass


LEG_STATS = {
    "Points": "PTS",
    "Rebounds": "REB",
    "Assists": "AST",
    "Threes Made": "FG3M",
    "Blocks": "BLK",
    "Steals": "STL",
}


@dataclass(frozen=True)
class ParlayLeg:
    player_id: int
    player_name: str
    stat: str
    line: float

    @property
    def stat_column(self) -> str:
        return LEG_STATS[self.stat]

    @property
    def key(self) -> str:
        return f"{self.player_id}:{self.stat}:{self.line:g}"

    @property
    def label(self) -> str:
        return f"{self.player_name} {self.line:g}+ {self.stat}"


@dataclass(frozen=True)
class LegResult:
    leg: ParlayLeg
    games_tested: int
    hits: int
    success_rate: float

    @property
    def label(self) -> str:
        return self.leg.label
