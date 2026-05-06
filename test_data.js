const fs = require('fs');
const code = fs.readFileSync('app.js', 'utf8');

const mockDOM = `
const window = { location: { origin: 'http://localhost' } };
const document = { 
  querySelector: () => ({}), 
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: () => ({ style: {} }),
  body: { style: {} }
};
const $ = () => ({});
const $$ = () => [];
const auth = {};
const onAuthStateChanged = () => {};
`;

const lines = code.split('\n');
const safeCode = lines.slice(0, 200).join('\n'); // Just get the SAMPLE_MOVIES definitions

eval(mockDOM + safeCode + `\nconsole.log("Popular Length:", SAMPLE_MOVIES.popular.length); console.log("Now Playing:", getSampleMovies('now_playing').length);`);
