const express = require('express');
const request = require('request');
const ejs = require('ejs');
const fs = require('fs');

const app = express();
app.set('view engine', 'ejs');
app.set("views", "./views/")

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));

const token = fs.readFileSync('token.txt', 'utf8').trim();
console.log("Key found");


  const BASE_URL = 'https://open.faceit.com/data/v4/';

  const API_HEADERS = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  };

  app.get('/', (req, res) => {
    res.render('index');
  });
  
  app.get('/stats', (req, res) => {
    const username = req.query.username;
  
    const getMatchesPlayed = request.get({
      url: `${BASE_URL}players?nickname=${username}`,
      headers: API_HEADERS
    }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const playerData = JSON.parse(body);
        const playerId = playerData.player_id;
        const statsUrl = `${BASE_URL}players/${playerId}/stats/cs2`;
  
        const getStats = request.get({
          url: statsUrl,
          headers: API_HEADERS
        }, (error, response, body) => {
          if (!error && response.statusCode === 200) {
            const statsData = JSON.parse(body);
            const stats = statsData.lifetime;
            const segments = statsData.segments || [];
            const matchesPlayed = parseInt(stats['Matches']);
            const matchesWon = parseInt(stats['Wins']);
            const winrate = (matchesWon / matchesPlayed) * 100;
            const cs2Data = playerData.games && playerData.games.cs2 ? playerData.games.cs2 : {};

            const profile = {
              avatar: playerData.avatar || '',
              country: playerData.country || '',
              faceitUrl: playerData.faceit_url ? playerData.faceit_url.replace('{lang}', 'en') : '',
              level: cs2Data.skill_level || 'N/A',
              elo: cs2Data.faceit_elo || 'N/A',
              region: cs2Data.region || 'N/A',
              steamId: playerData.platforms && playerData.platforms.steam ? playerData.platforms.steam : ''
            };

            const sum = (key) => segments.reduce((acc, seg) => acc + (parseFloat(seg.stats[key]) || 0), 0);
            const sumInt = (key) => segments.reduce((acc, seg) => acc + (parseInt(seg.stats[key]) || 0), 0);

            const totalMatches = sumInt('Matches');
            const totalKills = sumInt('Kills');
            const totalDeaths = sumInt('Deaths');
            const totalAssists = sumInt('Assists');
            const totalMVPs = sumInt('MVPs');
            const totalTriple = sumInt('Triple Kills');
            const totalQuadro = sumInt('Quadro Kills');
            const totalPenta = sumInt('Penta Kills');
            const totalHeadshots = sumInt('Headshots');

            const computed = {
              totalKills,
              totalDeaths,
              totalAssists,
              totalMVPs,
              totalTriple,
              totalQuadro,
              totalPenta,
              totalHeadshots,
              avgKills: totalMatches ? (totalKills / totalMatches).toFixed(2) : 'N/A',
              avgDeaths: totalMatches ? (totalDeaths / totalMatches).toFixed(2) : 'N/A',
              avgAssists: totalMatches ? (totalAssists / totalMatches).toFixed(2) : 'N/A',
              kd: totalDeaths ? (totalKills / totalDeaths).toFixed(2) : 'N/A',
              hsPercent: totalKills ? ((totalHeadshots / totalKills) * 100).toFixed(1) : 'N/A',
            };

            res.render('stats', { username, stats, winrate, segments, profile, computed });
          } else {
            res.status(404).send('Could not get stats');
          }
        });
      } else {
        res.status(404).send('Could not find user');
      }
    });
  });
  
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });