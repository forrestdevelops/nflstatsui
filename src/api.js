const BASE = '/nfl';

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export function getTeams() {
  return fetchJSON(`${BASE}/teams`);
}

export function getTeam(teamId) {
  return fetchJSON(`${BASE}/teams/${teamId}`);
}

export function getPlayerProfile(playerId) {
  return fetchJSON(`${BASE}/players/${playerId}/stats`);
}

export function getPlayerSeasonStats(playerId, season) {
  return fetchJSON(`${BASE}/players/${playerId}/stats/${season}`);
}

export function getPlayerGameLog(playerId, season) {
  const path = season
    ? `${BASE}/players/${playerId}/gamelog/${season}`
    : `${BASE}/players/${playerId}/gamelog`;
  return fetchJSON(path);
}
