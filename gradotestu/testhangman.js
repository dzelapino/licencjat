import React, { useState } from "react";
import Button from "@/components/button";
import styles from "@/styles/games/Hangman.module.scss";
import Modal from "@/components/modals/modal";
import { words } from "public/words";
import { selectId } from "slices/authSlice";
import { useSelector } from "react-redux";
import postScore from "./postScore";
import TwoButtonModal from "@/components/modals/twoButtonModal";

const Hangman = () => {
  const [word, setWord] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [secondModalOpen, setSecondModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("Game created");
  const [modalButtonText, setModalButtonText] = useState("Redirect");
  const id = useSelector(selectId);

  const openModal = (modalMessage, modalButtonText) => {
    setModalMessage(modalMessage);
    setModalButtonText(modalButtonText);
    setModalOpen(true);
  };

  const openSecondModal = () => {
    setSecondModalOpen(true);
  };

  const saveScore = (data) => {
    postScore(data);
    setSecondModalOpen(false);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleStartGame = () => {
    //TODO: CONNECT WITH DATABASE OF WORDS OR IMPORT FROM CONST
    const randomIndex = Math.floor(Math.random() * words.length);
    setWord(words[randomIndex]);
    setGuesses([]);
    setIncorrectGuesses(0);
  };

  const handleGuess = (letter) => {
    if (!guesses.includes(letter)) {
      setGuesses([...guesses, letter]);
      if (!word.includes(letter)) {
        if (incorrectGuesses === 9) {
          openModal(`You lose! The correct word was: "${word}"`, "OK");
        }
        setIncorrectGuesses(incorrectGuesses + 1);
      }
    }
  };

  let isWinner =
    word !== "" && word.split("").every((letter) => guesses.includes(letter));

  if (isWinner) {
    setWord("");
    isWinner = false;
    openSecondModal();
  }

  const parts = [
    <line className={styles.hangman__line} x1="0" y1="350" x2="300" y2="350" />,
    <line className={styles.hangman__line} x1="50" y1="350" x2="50" y2="50" />,
    <line className={styles.hangman__line} x1="50" y1="50" x2="200" y2="50" />,
    <line
      className={styles.hangman__line}
      x1="200"
      y1="50"
      x2="200"
      y2="100"
    />,
    <circle
      className={styles.hangman__line}
      cx="200"
      cy="135"
      r="35"
      fill="transparent"
    />,
    <line
      className={styles.hangman__line}
      x1="200"
      y1="170"
      x2="200"
      y2="270"
    />,
    <line
      className={styles.hangman__line}
      x1="200"
      y1="210"
      x2="150"
      y2="260"
    />,
    <line
      className={styles.hangman__line}
      x1="200"
      y1="210"
      x2="250"
      y2="260"
    />,
    <line
      className={styles.hangman__line}
      x1="200"
      y1="270"
      x2="150"
      y2="320"
    />,
    <line
      className={styles.hangman__line}
      x1="200"
      y1="270"
      x2="250"
      y2="320"
    />,
  ];
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  return (
    <div className={styles.hangman}>
      {modalOpen ? (
        <Modal
          modalText={modalMessage}
          buttonFunction={closeModal}
          buttonText={modalButtonText}
        />
      ) : null}
      {secondModalOpen ? (
        <TwoButtonModal
          modalText={`Your score is ${1000}. Do You want to make this score public?`}
          mainButtonLeft={true}
          leftButtonText={"Yes"}
          leftButtonFunction={saveScore}
          leftButtonFunctionParameters={
            {"amount": "1000", "private": false, "game": "testhangman", "player": id}
          }
          rightButtonText={"No"}
          rightButtonFunction={saveScore}
          rightButtonFunctionParameters={
            {"amount": "1000", "private": true, "game": "testhangman", "player": id}
          }
        />
      ) : null}
      <div className={styles.hangman__game}>
        <h1>Hangman</h1>
        <h2>{word}</h2>
        <div>
          <svg className={styles.hangman__svg}>
            {...parts.slice(0, incorrectGuesses)}
          </svg>
        </div>
        {word ? (
          <div>
            <p>{`Word: ${word
              .split("")
              .map((letter) => (guesses.includes(letter) ? letter : "_"))
              .join(" ")}`}</p>
            <p>{`Guesses left: ${10 - incorrectGuesses}`}</p>
            {isWinner ? (
              <p>Congratulations, you won!</p>
            ) : (
              <p>
                {incorrectGuesses < 10
                  ? "Keep guessing!"
                  : "Close one, try again!"}
              </p>
            )}
          </div>
        ) : (
          <button className={styles.hangman__start} onClick={handleStartGame}>
            START NEW GAME
          </button>
        )}
        {word && incorrectGuesses < 10 && !isWinner ? (
          <div className={styles.hangman__words}>
            {letters.map((letter) => (
              <Button
                key={letter}
                value={letter}
                handleClick={() => handleGuess(letter.toLowerCase())}
              />
            ))}
          </div>
        ) : null}
        {incorrectGuesses === 10 ? (
          <button className={styles.hangman__start} onClick={handleStartGame}>
            PLAY AGAIN
          </button>
        ) : null}
        {isWinner ? (
          <button className={styles.hangman__start} onClick={handleStartGame}>
            PLAY AGAIN
          </button>
        ) : null}
      </div>
    </div>
  );
};
export default Hangman;
