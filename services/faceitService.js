// Uses Node 18+ native fetch — no extra dependencies needed
const { BASE_URL, API_HEADERS } = require('../config');

async function apiFetch(path) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: API_HEADERS });
  if (!res.ok) {
    const err = new Error(`FACEIT API error: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function getPlayer(nickname) {
  return apiFetch(`players?nickname=${encodeURIComponent(nickname)}`);
}

function getPlayerStats(playerId) {
  return apiFetch(`players/${playerId}/stats/cs2`);
}

function getMatchHistory(playerId, limit = 30) {
  return apiFetch(`players/${playerId}/history?game=cs2&limit=${limit}`);
}

module.exports = { getPlayer, getPlayerStats, getMatchHistory };
