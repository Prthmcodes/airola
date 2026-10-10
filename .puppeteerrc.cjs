// Keep Puppeteer's Chrome inside node_modules so Vercel's dependency cache keeps it between builds
// (the default ~/.cache location isn't cached, so cached installs would have no browser).
const { join } = require('path');

module.exports = {
  cacheDirectory: join(__dirname, 'node_modules', '.cache', 'puppeteer'),
};
