const fs = require('fs');
const path = require('path');

const quotes = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'quotes/starcraft-2-quotes.json'))
);

module.exports = quotes;
