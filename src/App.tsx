import { useEffect, useState } from 'react';
import { cn } from './lib/utils';

// types
interface Category {
  id: number;
  name: string;
}
interface Question {
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  answers: string[];
}
interface Config {
  score: number;
  amount: number;
  category: string;
  level: string;
}
const defaultConfig: Config = {
  amount: 3,
  score: 0,
  category: 'Select Category',
  level: 'easy',
};

const App = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [question, setQuestion] = useState<Question[]>([]);
  const [numberQuestion, setNumberQuestion] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://opentdb.com/api_category.php')
      .then((response) => response.json())
      .then((data) => setCategories(data.trivia_categories))
      .catch((err) => console.log(err));
  }, []);

  const handleStart = () => {
    fetch(
      `https://opentdb.com/api.php?amount=${config.amount}&category=${config.category}&difficulty=${config.level}`
    )
      .then((response) => response.json())
      .then((data) => {
        const shuffled = data.results.map((question: Question) => {
          const answers = [
            ...question.incorrect_answers,
            question.correct_answer,
          ];
          console.log('Questions ->', data);
          return {
            ...question,
            answers: shuffleArray(answers),
          };
        });
        console.log('Shuffled Questions ->', shuffled);
        setQuestion(shuffled);
      })
      .catch((error) => console.error(error));
  };
  const shuffleArray = (arr: string[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const handleAnswer = (answer: string) => {
    console.log('userAnswer', userAnswer, 'answer', answer);
    setUserAnswer(answer);
  };

  const handleCheck = () => {
    console.log('userAnswer', userAnswer, 'numberQuestion', numberQuestion);
    const isCorrect = userAnswer === question[numberQuestion].correct_answer;
    if (isCorrect) {
      setConfig((prev) => ({
        ...prev,
        score: prev.score + 1,
      }));
    }
    setUserAnswer(null);
    setNumberQuestion((prev) => prev + 1);
  };

  const handleRestart = () => {
    setConfig(defaultConfig);
    setQuestion([]);
    setNumberQuestion(0);
    setUserAnswer(null);
  };

  const handleNumberInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseInt(event.target.value);
    setConfig((prev) => ({ ...prev, amount }));
  };

  const handleDifficulty = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const level = event.target.value;
    setConfig((prev) => ({ ...prev, level }));
  };
  // select category and start
  if (question.length === 0) {
    return (
      <section className="flex flex-col justify-center items-center p-20 ">
        <label htmlFor="category">Select category:</label>
        <select
          id="category"
          value={config.category}
          onChange={(e) =>
            setConfig((prev) => ({ ...prev, category: e.target.value }))
          }
          className="block px-2 py-2 w-5/12 rounded-lg border-1 border-gray-500"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <label htmlFor="amountQuestions">Number of questions:</label>
        <input
          id="amountQuestions"
          className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border-1 border-gray-300 appearance-none dark:text-gray-50 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          type="number"
          value={config.amount}
          max={10}
          min={3}
          onChange={handleNumberInput}
        />

        <label htmlFor="difficulty">Difficulty:</label>
        <select
          id="difficulty"
          value={config.level}
          onChange={handleDifficulty}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <button
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
          onClick={handleStart}
        >
          Start Quiz
        </button>
      </section>
    );
  }
  // end quiz, finish result and start again
  if (numberQuestion === question.length) {
    return (
      <section className="flex flex-col justify-center items-center p-20 ">
        <p>Score: {config.score}</p>
        <p>Correct answers: {config.score}</p>
        <p>Incorrect answers: {config.amount - config.score}</p>
        <button
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
          onClick={handleRestart}
        >
          Start Again
        </button>
      </section>
    );
  }
  // render question card
  const currentQuestion = question[numberQuestion];
  return (
    <section className="flex flex-col justify-center items-center p-20 ">
      <p>
        Question {numberQuestion + 1} of {config.amount}
      </p>
      <p>Score: {config.score}</p>
      <p>Category: {currentQuestion.category}</p>
      <p>{currentQuestion.question}</p>
      {currentQuestion.answers.map((answer) => (
        <button
          className={cn(
            'hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200',
            {
              'opacity-50, bg-gray-400': answer === null,
            }
          )}
          key={answer}
          disabled={!!userAnswer} // !== null
          onClick={() => handleAnswer(answer)}
        >
          {answer}
        </button>
      ))}
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200"
        disabled={userAnswer === null}
        onClick={handleCheck}
      >
        Next
      </button>
    </section>
  );
};

export default App;
