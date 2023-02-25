const express = require('express');
const request = require('request');
const ejs = require('ejs');
const fs = require('fs');

const app = express();
app.set('view engine', 'ejs');
app.set("views", "./views/")

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));

const token = fs.readFile('token.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Key found");
  });


  const BASE_URL = 'https://open.faceit.com/data/v4/';

  const API_HEADERS = {
    'Authorization': token,
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
        const statsUrl = `${BASE_URL}players/${playerId}/stats/csgo`;
  
        const getStats = request.get({
          url: statsUrl,
          headers: API_HEADERS
        }, (error, response, body) => {
          if (!error && response.statusCode === 200) {
            const statsData = JSON.parse(body);
            const stats = statsData.segments[0].stats;
            const matchesPlayed = stats.matches;
            const matchesWon = stats.wins;
            const winrate = (matchesWon / matchesPlayed) * 100;
  
            res.render('stats', { username, stats, winrate });
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