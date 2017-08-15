const fs = require('fs');

const target = './filtered-data';
const files = fs.readdirSync('filtered-data');

const json = files.map(file => require(`${target}/${file}`));

const final = json.reduce((fin, cur) => fin.concat(cur), []);

fs.writeFileSync('final.json', JSON.stringify(final));
