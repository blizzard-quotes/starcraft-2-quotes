/**
 * Transform Starcraft II quotes
 */
'use strict';
const fs = require('fs');
const path = require('path');
const uuidv5 = require('uuid/v5');

const pathInput = path.join(__dirname, '../quotes/extract');
const pathOutput = path.join(__dirname, '../quotes/transform');
const pathQuotes = path.join(__dirname, '../quotes/starcraft-2-quotes.json');

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
    let cleanUnit = cleanQuoteUnit(quote['unit']);
    let cleanValue = cleanQuoteValue(quote['value']);
    let cleanFaction = cleanQuoteFaction(quote['faction']);
    let cleanAction = cleanQuoteAction(quote['action']);

    let cleanQuote = {
      value: cleanValue,
      faction: cleanFaction,
      unit: cleanUnit,
      action: cleanAction,
      isHero: quote['isHero'],
      isMelee: quote['isMelee'],
      id: uuidv5(
        `${cleanValue} ${cleanFaction} ${cleanUnit} ${cleanAction}`,
        uuidv5.URL
      )
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

fs.mkdir(pathOutput, { recursive: true }, err => {
  if (err) throw err;
});

let files = fs.readdirSync(pathInput);
let quotes = [];

files.forEach(function(file) {
  quotes = quotes.concat(
    quoteTransformer(`${pathInput}/${file}`, `${pathOutput}/${file}`)
  );
});

let data = JSON.stringify(quotes, null, 2);

fs.writeFileSync(pathQuotes, data);
console.log('WEAPONS CHARGED AND READY');
console.log(`OUTPUT: ${pathQuotes}`);
