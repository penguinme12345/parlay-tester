from __future__ import annotations

from dataclasses import asdict

import pandas as pd
import streamlit as st

from parlay_doctor.analysis import analyze_parlay
from parlay_doctor.data import NbaApiDataProvider, current_nba_season
from parlay_doctor.models import LEG_STATS, ParlayLeg


st.set_page_config(page_title="Parlay Doctor", page_icon="PD", layout="wide")


@st.cache_resource
def get_provider() -> NbaApiDataProvider:
    return NbaApiDataProvider()


@st.cache_data(ttl=60 * 60)
def find_players(query: str) -> list[dict]:
    if len(query.strip()) < 2:
        return []
    return get_provider().search_players(query)


@st.cache_data(ttl=60 * 60)
def load_game_log(player_id: int, season: str) -> pd.DataFrame:
    return get_provider().get_player_game_log(player_id=player_id, season=season)


def init_state() -> None:
    st.session_state.setdefault("legs", [])
    st.session_state.setdefault("player_query", "")
    st.session_state.setdefault("selected_player", None)


def add_leg(leg: ParlayLeg) -> None:
    st.session_state.legs.append(asdict(leg))


def remove_leg(index: int) -> None:
    st.session_state.legs.pop(index)


def available_seasons() -> list[str]:
    current = current_nba_season()
    start_year = int(current.split("-")[0])
    return [f"{year}-{str(year + 1)[-2:]}" for year in range(start_year, start_year - 6, -1)]


init_state()

st.title("Parlay Doctor")
st.caption("Historical NBA parlay analysis using player game logs. No odds, no predictions, just hit rates.")

with st.sidebar:
    st.header("Create Parlay")
    season = st.selectbox("Season", available_seasons(), index=0)

    query = st.text_input("Player", placeholder="Search player name")
    matches = find_players(query)

    player_options = {f"{p['full_name']} ({p['id']})": p for p in matches}
    selected_label = st.selectbox(
        "Matching players",
        list(player_options.keys()),
        index=None,
        placeholder="Choose a player",
        disabled=not player_options,
    )

    stat = st.selectbox("Statistic", list(LEG_STATS.keys()))
    line = st.number_input("Line", min_value=0.0, max_value=100.0, value=10.0, step=0.5)

    if st.button("Add Leg", type="primary", use_container_width=True, disabled=selected_label is None):
        player = player_options[selected_label]
        add_leg(
            ParlayLeg(
                player_id=int(player["id"]),
                player_name=player["full_name"],
                stat=stat,
                line=float(line),
            )
        )
        st.rerun()

legs = [ParlayLeg(**leg) for leg in st.session_state.legs]

left, right = st.columns([0.9, 1.1], gap="large")

with left:
    st.subheader("Legs")
    if not legs:
        st.info("Add at least one player prop to analyze a parlay.")
    else:
        for index, leg in enumerate(legs):
            cols = st.columns([0.72, 0.18])
            cols[0].markdown(f"**{leg.label}**")
            if cols[1].button("Remove", key=f"remove-{index}", use_container_width=True):
                remove_leg(index)
                st.rerun()

with right:
    st.subheader("Analysis")
    can_analyze = bool(legs)
    if st.button("Analyze", disabled=not can_analyze, type="primary", use_container_width=True):
        with st.spinner("Fetching game logs and calculating historical hit rates..."):
            logs = {
                leg.key: load_game_log(player_id=leg.player_id, season=season)
                for leg in legs
            }
            result = analyze_parlay(legs=legs, game_logs=logs)
            st.session_state["last_result"] = result

    result = st.session_state.get("last_result")
    if result:
        metric_cols = st.columns(4)
        metric_cols[0].metric("Games Tested", result.games_tested)
        metric_cols[1].metric("Parlay Hits", result.parlay_hits)
        metric_cols[2].metric("Hit Rate", f"{result.hit_rate:.1f}%")
        metric_cols[3].metric("Risk Score", f"{result.risk_score}/10")

        st.markdown(f"### {result.risk_label} Risk")
        st.write(result.verdict)

        if result.weakest_leg:
            st.warning(f"Weakest Leg: {result.weakest_leg.label} ({result.weakest_leg.success_rate:.1f}%)")

        leg_rows = [
            {
                "Leg": leg.label,
                "Games Tested": leg.games_tested,
                "Hits": leg.hits,
                "Success Rate": f"{leg.success_rate:.1f}%",
            }
            for leg in result.leg_results
        ]
        st.dataframe(leg_rows, hide_index=True, use_container_width=True)

        if not result.game_results.empty:
            st.markdown("#### Game Date Results")
            display = result.game_results.copy()
            display["parlay_hit"] = display["parlay_hit"].map({True: "Hit", False: "Miss"})
            st.dataframe(display, hide_index=True, use_container_width=True)
