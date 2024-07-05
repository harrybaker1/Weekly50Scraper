const { runScraper } = require('./scraper');
const cron = require('node-cron');
const app = require('./api');

const PORT = process.env.PORT || 3000;

//Quiz Scraper 4pm Every Friday
cron.schedule('0 16 * * 5', () => {
  console.log('Running quiz scraper.');
  runScraper().catch(console.error);
});

//API
app.listen(PORT, () => {
  console.log('Server is running on port 3000.');
});