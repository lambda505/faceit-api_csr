const { toSteamId64 } = require('./steamHelper');

function computeStats(segments) {
  const sumInt = (key) =>
    segments.reduce((acc, seg) => acc + (parseInt(seg.stats[key]) || 0), 0);

  const totalMatches  = sumInt('Matches');
  const totalKills    = sumInt('Kills');
  const totalDeaths   = sumInt('Deaths');
  const totalAssists  = sumInt('Assists');
  const totalMVPs     = sumInt('MVPs');
  const totalTriple   = sumInt('Triple Kills');
  const totalQuadro   = sumInt('Quadro Kills');
  const totalPenta    = sumInt('Penta Kills');
  const totalHeadshots= sumInt('Headshots');

  return {
    totalKills, totalDeaths, totalAssists, totalMVPs,
    totalTriple, totalQuadro, totalPenta, totalHeadshots,
    avgKills:   totalMatches ? (totalKills   / totalMatches).toFixed(2) : 'N/A',
    avgDeaths:  totalMatches ? (totalDeaths  / totalMatches).toFixed(2) : 'N/A',
    avgAssists: totalMatches ? (totalAssists / totalMatches).toFixed(2) : 'N/A',
    kd:         totalDeaths  ? (totalKills   / totalDeaths).toFixed(2)  : 'N/A',
    hsPercent:  totalKills   ? ((totalHeadshots / totalKills) * 100).toFixed(1) : 'N/A',
  };
}

function parseHistory(items, playerId) {
  return [...items].reverse().map((m) => {
    const f1 = m.teams && m.teams.faction1;
    const playerInF1 = f1 && f1.roster && f1.roster.some((p) => p.player_id === playerId);
    const playerFaction = playerInF1 ? 'faction1' : 'faction2';
    const won = m.results && m.results.winner === playerFaction;
    return {
      date:   new Date(m.finished_at * 1000).toLocaleDateString(),
      result: won ? 1 : 0,
      elo:    m.elo ? parseInt(m.elo) : null,
    };
  });
}

function buildProfile(playerData) {
  const cs2Data = playerData.games && playerData.games.cs2 ? playerData.games.cs2 : {};
  return {
    avatar:    playerData.avatar || '',
    country:   playerData.country || '',
    faceitUrl: playerData.faceit_url ? playerData.faceit_url.replace('{lang}', 'en') : '',
    level:     cs2Data.skill_level  || 'N/A',
    elo:       cs2Data.faceit_elo   || 'N/A',
    region:    cs2Data.region       || 'N/A',
    steamId: (() => {
      const raw = playerData.platforms && playerData.platforms.steam ? playerData.platforms.steam : '';
      if (!raw) return '';
      const stripped = raw.replace(/^steam_/i, '');
      // Try direct parse (handles SteamID64, full SteamID2, SteamID3)
      return toSteamId64(stripped) || toSteamId64(`STEAM_${stripped}`) || stripped;
    })(),
  };
}

module.exports = { computeStats, parseHistory, buildProfile };
