const { runScraper } = require('./scraper');
const cron = require('node-cron');
const app = require('./api');

const PORT = process.env.PORT || 3000;

// Function to run the scraper and handle errors
const initialScraper = async () => {
  try {
    console.log('Running quiz scraper on startup.');
    await runScraper();
  } catch (error) {
    console.error('Error running scraper on startup:', error);
  }
};

// Quiz Scraper 4pm Every Friday
cron.schedule('0 16 * * 5', () => {
  console.log('Running quiz scraper.');
  runScraper().catch(console.error);
});

initialScraper();

// API
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
