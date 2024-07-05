const puppeteer = require('puppeteer');
const moment = require('moment')
const { saveToDatabase } = require('./db');

const dbConfig = {
  host: 'weekly-50-quiz-scraper-db.cboa6ua08wb8.ap-southeast-2.rds.amazonaws.com',
  user: 'admin',
  password: 'M11wvKBduG4ACNEdWU9b',
  database: 'weekly_50_quiz_db'
};

async function scrapeQuizData(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  await page.waitForSelector('div.quizTitle');

  const quizDetails = await page.evaluate(() => {
    const quizTitle = document.querySelector('div.quizTitle').innerText.trim();
    const [quizNumberText, quizDate] = quizTitle.split(' - ');

    const questions = document.querySelectorAll('div.question');
    const answerElements = document.querySelectorAll('div.panel p.answerText');

    let data = {
      quizNumber: parseInt(quizNumberText.replace('Quiz ', '').trim(), 10),
      quizDate: quizDate.trim(),
      questions: []
    };

    questions.forEach((questionElement, index) => {
      let questionText = questionElement.innerText.trim();
      questionText = questionText.replace(/^\d+\.\s*/, '');

      const answerText = answerElements[index].innerText.trim();

      data.questions.push({ questionNumber: index + 1, questionText, questionAnswer: answerText });
    });

    return data;
  });

  await browser.close();

  quizDetails.quizDate = moment(quizDetails.quizDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
  return quizDetails;
}

async function runScraper() {
  const url = 'https://theweeklyfifty.com.au/this-weeks-quiz/?nocache=1';
  const quizData = await scrapeQuizData(url);
  console.log(quizData);

  if (quizData.questions.length > 0) {
    await saveToDatabase(quizData);
  } else {
    console.log('No quiz data found.');
  }
  
}

module.exports = { runScraper };