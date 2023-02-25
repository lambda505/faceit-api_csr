const express = require('express');
const request = require('request');
const ejs = require('ejs');
const fs = require('fs');

const app = express();
app.set('view engine', 'ejs');
app.set("views", "./views/")
app.use(express.static(__dirname + '/public'));

const token = fs.readFile('token.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(data);
  });


app.get('/', (req, res) => {
  res.render('index');
});

app.get('/faceit/:username', (req, res) => {
    const options = {
        url: `https://open.faceit.com/data/v4/players?nickname=${req.params.username}`,
        headers: {'Authorization': token}
    };

request(options, (error, response, body) => {
    if (!error && response.statusCode == 200) {
        const data = JSON.parse(body);
        const player_id = data.player_id;

        const options = {
                url: `https://open.faceit.com/data/v4/players/${player_id}/stats/csgo`,
                headers: { 'Authorization': token }
        };

        request(options, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const data = JSON.parse(body);
                res.json({
                    win_rate: data.lifetime.win_rate,
                    matches: data.lifetime.m1,
                });
            } else {
                res.status(response.statusCode).send(error);
            }
        });
    } else {
        res.status(response.statusCode).send(error);
    }
  });
});


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
