const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'static.json');
const dest = path.join(__dirname, 'dist', 'static.json');

fs.copyFileSync(src, dest);
console.log('Copied static.json to dist/static.json');
