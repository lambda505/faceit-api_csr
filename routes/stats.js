const { Router } = require('express');
const faceit = require('../services/faceitService');
const { computeStats, parseHistory, buildProfile } = require('../utils/statsHelper');

const router = Router();

router.get('/', async (req, res) => {
  const { username } = req.query;

  try {
    const playerData = await faceit.getPlayer(username);
    const playerId   = playerData.player_id;

    // Fetch stats and match history in parallel
    const [statsData, histData] = await Promise.all([
      faceit.getPlayerStats(playerId),
      faceit.getMatchHistory(playerId),
    ]);

    const stats    = statsData.lifetime;
    const segments = statsData.segments || [];
    const wins     = parseInt(stats['Wins']);
    const matches  = parseInt(stats['Matches']);
    const winrate  = (wins / matches) * 100;

    const profile  = buildProfile(playerData);
    const computed = computeStats(segments);
    const history  = parseHistory(histData.items || [], playerId);

    res.render('stats', { username, stats, winrate, segments, profile, computed, history });
  } catch (err) {
    if (err.status === 404) {
      res.status(404).send('Player not found');
    } else {
      console.error(err);
      res.status(500).send('Something went wrong');
    }
  }
});

module.exports = router;
