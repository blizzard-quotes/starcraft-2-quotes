/**
 * Extract Starcraft II quotes from online
 */
'use strict';
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const url = 'https://starcraft.fandom.com/wiki/StarCraft_II_unit_quotations';

const pathOutput = path.join(__dirname, '../quotes/extract');

/**
 * Extract all quotes from specified uri for faction
 * @param {string} faction - the faction to extract quotes from
 */
const quotesExtractor = async (faction, order) => {
  console.log('SCV READY');
  console.log(`EXTRACTING INFORMATION FOR: ${faction}`);

  let unit, action;
  let actions = [];
  let quotes = [];
  let quote = {};

  try {
    const response = await axios.get(url);

    let $ = cheerio.load(response.data);
    let current_element = $(`#${faction}`).parent();

    do {
      current_element = $(current_element).next();

      if (current_element.is('h4')) {
        unit = current_element.children().attr('id');
      }

      if (current_element.is('table')) {
        actions = [];

        current_element
          .children()
          .children()
          .each((i, row) => {
            if (i % 2 === 0) {
              let columns = $(row).children();

              columns.each((i, column) => {
                actions.push($(column).text());
              });
            } else {
              let columns = $(row).children();

              columns.each((i, column) => {
                action = actions.shift();
                $('li', column).each((i, value) => {
                  quote = {
                    value: $(value).text(),
                    faction: faction.charAt(0).toUpperCase() + faction.slice(1),
                    unit: unit,
                    action: action
                  };
                  quotes.push(quote);
                });
              });
            }
          });
      }
    } while (
      $(current_element).next()[0] !== undefined &&
      !$(current_element)
        .next()
        .is('h2')
    );
  } catch (err) {
    console.log(err);
  }

  let data = JSON.stringify(quotes, null, 2);

  fs.mkdir(pathOutput, { recursive: true }, err => {
    if (err) throw err;
  });

  fs.writeFileSync(
    `${pathOutput}/${order}-${faction.toLowerCase()}.json`,
    data
  );
  console.log('JOBS FINISHED');
  console.log(`OUTPUT: ${pathOutput}/${order}-${faction.toLowerCase()}.json`);
};

quotesExtractor('Terran', 1);
quotesExtractor('Zerg', 2);
quotesExtractor('Protoss', 3);
quotesExtractor('Hybrid', 4);
