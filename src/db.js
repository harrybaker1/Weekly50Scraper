const mysql = require('mysql2');
const dbConfig = {
  host: 'weekly-50-quiz-scraper-db.cboa6ua08wb8.ap-southeast-2.rds.amazonaws.com',
  user: 'admin',
  password: 'M11wvKBduG4ACNEdWU9b',
  database: 'weekly_50_quiz_db'
};

const connection = mysql.createConnection(dbConfig);

async function saveToDatabase(quizData) {
  
    const checkQuizExistsQuery = 'SELECT COUNT(*) AS count FROM quizzes WHERE quiz_number = ?';
    const insertQuizQuery = 'INSERT INTO quizzes (quiz_number, quiz_date) VALUES (?, ?)';
    const insertQuestionQuery = 'INSERT INTO questions (quiz_number, question_number, question_text, question_answer) VALUES (?, ?, ?, ?)';
  
    try {
      const [rows] = await connection.promise().query(checkQuizExistsQuery, [quizData.quizNumber]);
      const quizExists = rows[0].count > 0;
  
      if (quizExists) {
        console.log(`Quiz ${quizData.quizNumber} already exists. Skipping insertion.`);
        return;
      }
  
      // Save quiz
      await connection.promise().query(insertQuizQuery, [quizData.quizNumber, quizData.quizDate]);
  
      // Save quiz questions
      for (const { questionNumber, questionText, questionAnswer } of quizData.questions) {
        await connection.promise().query(insertQuestionQuery, [quizData.quizNumber, questionNumber, questionText, questionAnswer]);
      }
  
      console.log(`Quiz ${quizData.quizNumber} inserted successfully.`);
    } catch (error) {
      console.error('Database operation failed:', error);
    }
  }

  function getQuizzes() {
    return new Promise((resolve, reject) => {
      connection.query('SELECT quiz_number, DATE_FORMAT(quiz_date, "%d/%m/%Y") AS formatted_date FROM quizzes', (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });
  }  

function getQuiz(quizNumber) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT question_number, question_text, question_answer FROM questions WHERE quiz_number = ?', [quizNumber], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });
  }

module.exports = { saveToDatabase, getQuizzes, getQuiz };
