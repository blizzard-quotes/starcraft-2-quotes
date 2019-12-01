/**
 * Transform Starcraft II quotes
 */
'use strict';
const fs = require('fs');
const uuidv4 = require('uuid/v4');

const INPUT_DIRECTORY = './quotes/extract';
const OUTPUT_DIRECTORY = './quotes/transform';

/**
 * Ensure strings are clean / neat for .json file
 * @param {string} value - string to make 'clean'
 */
function cleanString(value) {
  return (
    value
      // Remove newlines / carriage returns
      .replace(/\r?\n|\r/g, ' ')
      // Remove quotations
      .replace(/["]+/g, '')
      // Remove ( )
      .replace(/\([^)]*\)/g, '')
      // Remove *
      .replace(/\*[^*]*\*/g, '')
      // Remove < >
      .replace(/\<[^*]*\>/g, '')
      // Remove double spaces
      .replace(/  /g, ' ')
      // Add space after question mark
      .replace(/(\?)([A-Za-z])/g, '$1 $2')
      .trim()
  );
}

/**
 * Ensure unit name is clean / correct
 * @param {string} unit - unit to 'clean'
 */
function cleanQuoteUnit(unit) {
  if (unit.includes(`Fenix`)) {
    return 'Talandar';
    // Consider adding an additional key/value pair for alternative names
  } else if (unit.includes(`Mothership_Core`)) {
    return 'Mothership';
  } else if (unit.includes(`Dominion_Laborer`)) {
    return 'Dominion Trooper';
  }

  return cleanString(unit)
    .replace(/\.2F/g, ' ')
    .replace(/\.27/g, "'")
    .replace(/_/g, ' ');
}

/**
 * Ensure action is clean / correct
 * @param {string} action - action to 'clean'
 */
function cleanQuoteAction(action) {
  if (action.includes('Repeatedly selected')) {
    return 'Pissed';
  } else if (action.includes('Other lines')) {
    return 'Other';
  } else if (action.includes('Attack order')) {
    return 'Attack';
  } else if (action.includes('Move order')) {
    return 'Move';
  } else if (action.includes('When attacked')) {
    return 'Attacked';
  } else if (action.includes('Confirming order')) {
    return 'Confirming';
  }

  return cleanString(action);
}

/**
 * Ensure faction is clean / correct
 * @param {string} faction - faction to 'clean'
 */
function cleanQuoteFaction(faction) {
  return cleanString(faction);
}

/**
 * Ensure the actual quote is clean / correct
 * @param {string} value - the actual quote to 'clean'
 */
function cleanQuoteValue(value) {
  return cleanString(value);
}

/**
 * Transforms all quotes including metadata
 * @param {string} input - the name of the JSON file to transform
 * @param {string} output  - the location of the transformed JSON file
 */
function quoteTransformer(input, output) {
  console.log('WHO CALLED IN THE FLEET');
  console.log(`TRANSFORMING: ${input}`);

  let cleanQuotes = [];

  let rawData = fs.readFileSync(input);
  let quotes = JSON.parse(rawData);

  quotes.forEach(function(quote) {
    let cleanQuote = {
      value: cleanQuoteValue(quote['value']),
      faction: cleanQuoteFaction(quote['faction']),
      unit: cleanQuoteUnit(quote['unit']),
      action: cleanQuoteAction(quote['action'])
    };

    if (cleanQuote['value'] !== '') {
      cleanQuotes.push(cleanQuote);
    }
  });

  let data = JSON.stringify(cleanQuotes, null, 2);

  fs.writeFileSync(output, data);
  console.log('WEAPONS CHARGED AND READY');
  console.log(`OUTPUT: ${output}`);

  return cleanQuotes;
}

/**
 * Adds short uuid for all quote objects
 * @param {array} quotes - an array of quote objects
 */
function shortId(quotes) {
  let uniqueIds = [];
  quotes.forEach(function(quote, i) {
    let uniqueId;
    let isUnique;
    do {
      uniqueId = uuidv4().split('-')[0];
      isUnique = false;
      if (!uniqueIds.includes(uniqueId)) {
        uniqueIds.push(uniqueId);
        isUnique = true;
      }
    } while (!isUnique);

    quote['id'] = uniqueId;
  });
}

fs.mkdir(OUTPUT_DIRECTORY, { recursive: true }, err => {
  if (err) throw err;
});

// succubus.json was manually created. Not found on wowwiki
const FILES = ['protoss.json', 'terran.json', 'zerg.json', 'hybrid.json'];

let quotes = [];

FILES.forEach(function(file) {
  quotes = quotes.concat(
    quoteTransformer(
      `${INPUT_DIRECTORY}/${file}`,
      `${OUTPUT_DIRECTORY}/${file}`
    )
  );
});

shortId(quotes);

let data = JSON.stringify(quotes, null, 2);

if (!fs.existsSync('./quotes/starcraft-2-quotes.json')) {
  fs.writeFileSync('./quotes/starcraft-2-quotes.json', data);
  console.log('WEAPONS CHARGED AND READY');
  console.log(`OUTPUT: ./quotes/starcraft-2-quotes.json`);
}
