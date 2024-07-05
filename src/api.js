const express = require('express');
const { getQuizzes, getQuiz } = require('./db');

const app = express();

app.get('/api/quizzes', async (req, res) => {
  try {
    const quizzes = await getQuizzes();
    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/quiz/:quizNumber', async (req, res) => {
  const quizNumber = req.params.quizNumber;
  if (isNaN(quizNumber)) {
    return res.status(400).json({ error: 'Invalid quiz number format' });
  }
  
  try {
    const quiz = await getQuiz(quizNumber);
    if (quiz) {
      res.status(200).json(quiz);
    } else {
      res.status(404).json({ error: 'Quiz not found' });
    }
  } catch (error) {
    console.error(`Error fetching quiz ${quizNumber}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = app;
