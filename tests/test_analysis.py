from __future__ import annotations

import pandas as pd

from parlay_doctor.analysis import analyze_parlay, risk_assessment
from parlay_doctor.models import ParlayLeg


def test_analyze_parlay_uses_common_game_dates() -> None:
    brunson = ParlayLeg(player_id=1, player_name="Brunson", stat="Points", line=25)
    towns = ParlayLeg(player_id=2, player_name="Towns", stat="Rebounds", line=10)

    logs = {
        brunson.key: pd.DataFrame(
            {
                "GAME_DATE": ["2025-01-01", "2025-01-03", "2025-01-05"],
                "PTS": [26, 24, 30],
            }
        ),
        towns.key: pd.DataFrame(
            {
                "GAME_DATE": ["2025-01-01", "2025-01-05", "2025-01-07"],
                "REB": [11, 8, 9],
            }
        ),
    }

    result = analyze_parlay([brunson, towns], logs)

    assert result.games_tested == 2
    assert result.parlay_hits == 1
    assert result.hit_rate == 50
    assert result.weakest_leg is not None
    assert result.weakest_leg.label == "Towns 10+ Rebounds"


def test_risk_assessment_thresholds() -> None:
    assert risk_assessment(36)[0:2] == ("Low", 3)
    assert risk_assessment(20)[0:2] == ("Medium", 6)
    assert risk_assessment(19.9)[0:2] == ("High", 8)
