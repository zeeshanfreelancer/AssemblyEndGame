import { useState, useEffect } from "react";
import { languages } from "./languages";
import { clsx } from "clsx";
import { getFarewellText, getRandomWord } from "./utils";
import Confetti from "react-confetti";

export default function AssemblyEndgame() {
  const [currentWord, setCurrentWord] = useState(() => getRandomWord());
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isGameLost, setIsGameLost] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lastGuessedLetter, setLastGuessedLetter] = useState(null);

  const wrongGuessCount = guessedLetters.filter(
    (letter) => !currentWord.includes(letter)
  ).length;

  const numGuessesLeft = languages.length - wrongGuessCount;

  useEffect(() => {
    setIsGameWon(currentWord.split("").every((letter) => guessedLetters.includes(letter)));
    setIsGameLost(wrongGuessCount >= languages.length - 1)
    setIsGameOver(isGameWon || isGameLost);
  }, [guessedLetters, currentWord, wrongGuessCount, numGuessesLeft, isGameWon, isGameLost]);

  const isLastGuessIncorrect = lastGuessedLetter && !currentWord.includes(lastGuessedLetter);

  const alphabet = "abcdefghijklmnopqrstuvwxyz";

  function addGuessedLetters(letter) {
    if (!guessedLetters.includes(letter)) {
      setGuessedLetters((prevLetters) => [...prevLetters, letter]);
      setLastGuessedLetter(letter);
    }
  }

  function startNewGame() {
    setCurrentWord(getRandomWord());
    setGuessedLetters([]);
    setLastGuessedLetter(null);
    setIsGameWon(false);
    setIsGameLost(false);
    setIsGameOver(false);
  }

  const languageElements = languages.map((lang, index) => {
    const isLanguageLost = index < wrongGuessCount;

    const styles = {
      backgroundColor: lang.backgroundColor,
      color: lang.color,
    };

    const className = clsx("chip", isLanguageLost && "lost");

    return (
      <span className={className} style={styles} key={lang.name}>
        {lang.name}
      </span>
    );
  });

  const letterElements = currentWord.split("").map((letter, index) => {
    const shouldRevealLetter = isGameLost || guessedLetters.includes(letter);
    const letterClassName = clsx(
      isGameLost && !guessedLetters.includes(letter) && "missed-letter"
    );

    return (
      <span key={index} className={letterClassName}>
        {shouldRevealLetter ? letter.toUpperCase() : ""}
      </span>
    );
  });

  const keyboardElements = alphabet.split("").map((letter) => {
    const isGuessed = guessedLetters.includes(letter);
    const isCorrect = isGuessed && currentWord.includes(letter);
    const isWrong = isGuessed && !currentWord.includes(letter);
    const className = clsx({
      correct: isCorrect,
      wrong: isWrong,
    });

    return (
      <button
        className={className}
        key={letter}
        disabled={isGameOver || isGuessed}
        aria-label={`Letter ${letter}`}
        onClick={() => addGuessedLetters(letter)}
      >
        {letter.toUpperCase()}
      </button>
    );
  });

  const gameStatusClass = clsx("game-status", {
    won: isGameWon,
    lost: isGameLost,
    farewell: !isGameOver && isLastGuessIncorrect,
  });

  function renderGameStatus() {
    if (!isGameOver && isLastGuessIncorrect) {
      return (
        <p className="farewell-message">
          {getFarewellText(languages[wrongGuessCount - 1].name)}
        </p>
      );
    }
    if (isGameWon) {
      return (
        <>
          <h2>You Win!</h2>
          <p>Well Done!</p>
        </>
      );
    }
    if (isGameLost) {
      return (
        <>
          <h2>Game over!</h2>
          <p>You lose! Better start Learning Assembly</p>
        </>
      );
    }

    return null;
  }

  return (
    <main>
      {isGameWon && <Confetti recycle={false} numberOfPieces={1000} />}
      <header>
        <h1>Assembly: Endgame</h1>
        <p>
          Guess the word within {languages.length} attempts to keep the
          programming world safe from Assembly!
        </p>
      </header>

      <section aria-live="polite" role="status" className={gameStatusClass}>
        {renderGameStatus()}
      </section>

      <section className="language-chips">{languageElements}</section>

      <section className="word">{letterElements}</section>

      <section className="sr-only" aria-live="polite" role="status">
        <p>
          {currentWord.includes(lastGuessedLetter)
            ? `Correct! The letter ${lastGuessedLetter} is in the word.`
            : `Sorry, the letter ${lastGuessedLetter} is not in the word.`}
          You have {numGuessesLeft} attempts left.
        </p>
        <p>
          Current word:{" "}
          {currentWord
            .split("")
            .map((letter) =>
              guessedLetters.includes(letter) ? letter + "." : "blank"
            )
            .join(" ")}
        </p>
      </section>

      <section className="keyboard">{keyboardElements}</section>

      {isGameOver && (
        <button className="new-game" onClick={startNewGame}>
          New Game
        </button>
      )}
    </main>
  );
}