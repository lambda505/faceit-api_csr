const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8').trim();

module.exports = {
  PORT: process.env.PORT || 3000,
  BASE_URL: 'https://open.faceit.com/data/v4/',
  API_HEADERS: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  },
};
