from __future__ import annotations

import sqlite3
from datetime import date
from pathlib import Path

import pandas as pd


CACHE_DIR = Path(".cache")
DB_PATH = CACHE_DIR / "parlay_doctor.sqlite"


class NbaApiDataProvider:
    def __init__(self, db_path: Path = DB_PATH) -> None:
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def search_players(self, query: str) -> list[dict]:
        from nba_api.stats.static import players

        matches = players.find_players_by_full_name(query)
        return [
            {"id": int(player["id"]), "full_name": player["full_name"]}
            for player in matches[:20]
            if player.get("is_active", True)
        ]

    def get_player_game_log(self, player_id: int, season: str) -> pd.DataFrame:
        cached = self._read_cached_log(player_id, season)
        if cached is not None:
            return cached

        from nba_api.stats.endpoints import playergamelog

        endpoint = playergamelog.PlayerGameLog(
            player_id=player_id,
            season=season,
            season_type_all_star="Regular Season",
            timeout=30,
        )
        log = endpoint.get_data_frames()[0]
        self._write_cached_log(player_id, season, log)
        return log

    def _init_db(self) -> None:
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS player_game_logs (
                    player_id INTEGER NOT NULL,
                    season TEXT NOT NULL,
                    payload TEXT NOT NULL,
                    fetched_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (player_id, season)
                )
                """
            )

    def _read_cached_log(self, player_id: int, season: str) -> pd.DataFrame | None:
        with sqlite3.connect(self.db_path) as conn:
            row = conn.execute(
                "SELECT payload FROM player_game_logs WHERE player_id = ? AND season = ?",
                (player_id, season),
            ).fetchone()

        if row is None:
            return None
        return pd.read_json(row[0], orient="split")

    def _write_cached_log(self, player_id: int, season: str, log: pd.DataFrame) -> None:
        payload = log.to_json(orient="split")
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                """
                INSERT INTO player_game_logs (player_id, season, payload)
                VALUES (?, ?, ?)
                ON CONFLICT(player_id, season)
                DO UPDATE SET payload = excluded.payload, fetched_at = CURRENT_TIMESTAMP
                """,
                (player_id, season, payload),
            )


def current_nba_season(today: date | None = None) -> str:
    today = today or date.today()
    start_year = today.year if today.month >= 10 else today.year - 1
    return f"{start_year}-{str(start_year + 1)[-2:]}"
