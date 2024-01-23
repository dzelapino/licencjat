import React, { createElement, useState, useEffect, useRef } from "react";
import styles from "@/styles/games/Wordle.module.scss";
import { dictionary } from "../../../public/dictionary";
import Modal from "@/components/modals/modal";
import TwoButtonModal from "@/components/modals/twoButtonModal";
import postScore from "./postScore";
import { selectId } from "slices/authSlice";
import { useSelector } from "react-redux";

function Wordle() {
  let points = 600;
  let moves = 0;
  const userId = useSelector(selectId);
  const [board, setBoard] = useState(
    Array(6)
      .fill()
      .map(() => Array(5).fill(""))
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalButtonText, setModalButtonText] = useState("");
  const [dualModalOpen, setDualModalOpen] = useState(false);

  const openModal = (modalMessage, modalButtonText) => {
    setModalMessage(modalMessage);
    setModalButtonText(modalButtonText);
    setModalOpen(true);
  };

  const saveScore = (data) => {
    postScore(data);
    setDualModalOpen(false);
  };

  const state = {
    secret: dictionary[Math.floor(Math.random() * dictionary.length)],
    currRow: 0,
    currCol: 0,
  };

  useEffect(() => {
    function handleKeyDown(event) {
      const key = event.key;
      if (key === "Enter") {
        if (state.currCol === 5) {
          const word = getcurrWord();
          if (isWordValid(word)) {
            revealWord(word);
            state.currRow++;
            state.currCol = 0;
          } else {
            openModal("Not a valid word.", "OK");
          }
        }
      }
      if (key === "Backspace") {
        removeLetter();
      }
      if (isLetter(key)) {
        addLetter(key.toLowerCase());
      }
    }

    document.body.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function getcurrWord() {
    return board[state.currRow].reduce((prev, curr) => prev + curr);
  }

  function isWordValid(word) {
    return dictionary.includes(word);
  }

  function getNumOfOccurrencesInWord(word, letter) {
    let result = 0;
    for (let i = 0; i < word.length; i++) {
      if (word[i] === letter) {
        result++;
      }
    }
    return result;
  }

  function getPositionOfOccurrence(word, letter, position) {
    let result = 0;
    for (let i = 0; i <= position; i++) {
      if (word[i] === letter) {
        result++;
      }
    }
    return result;
  }

  const revealWord = async (guess) => {
    // let points = 0;
    const row = state.currRow;
    const animation_duration = 500; // ms
    // const pointsList = []; // DOSTAJEMY ERROR GDY PUSH WYNIK ZE POINTS LIST NOT DEFINED
    // wiec zmienilem wynik na points - n * 100
    for (let i = 0; i < 5; i++) {
      const box = document.getElementById(`box-${row}-${i}`);
      const letter = board[row][i];
      const numOfOccurrencesSecret = getNumOfOccurrencesInWord(
        state.secret,
        letter
      );
      const numOfOccurrencesGuess = getNumOfOccurrencesInWord(guess, letter);
      const letterPosition = getPositionOfOccurrence(guess, letter, i);

      setTimeout(() => {
        const box = document.getElementById(`box-${row}-${i}`);
        if (
          numOfOccurrencesGuess > numOfOccurrencesSecret &&
          letterPosition > numOfOccurrencesSecret
        ) {
          box.classList.add(`${styles.wordle__box__empty}`);
        } else {
          if (letter === state.secret[i]) {
            points += 50;
            box.classList.add(`${styles.wordle__box__right}`);
          } else if (state.secret.includes(letter)) {
            points += 25;
            box.classList.add(`${styles.wordle__box__wrong}`);
          } else {
            box.classList.add(`${styles.wordle__box__empty}`);
          }
        }
        if (i === 4) {
          // pointsList.push(points);
          // points = 0;
        }
      }, ((i + 1) * animation_duration) / 2);

      box.classList.add(`${styles.wordle__box__animated}`);
      box.style.animationDelay = `${(i * animation_duration) / 2}ms`;
    }

    const isWinner = state.secret === guess;
    const isGameOver = state.currRow === 5;
    if (isWinner) {
      setModalMessage(`Winner winner chicken dinner! Your score is ${points}. Do You want to make this score public?`);
      setDualModalOpen(true);
    } else if (isGameOver) {
      points = points - moves * 100;
      setModalMessage(`Better luck next time! The word was ${state.secret}. Your score is ${points}. Do You want to make this score public?`);
      setDualModalOpen(true);
    } else {
      moves = moves + 1;
    }
  };

  function isLetter(key) {
    return key.length === 1 && key.match(/[a-z]/i);
  }

  function addLetter(letter) {
    if (state.currCol === 5) return;
    const newBoard = [...board];
    newBoard[state.currRow][state.currCol] = letter;
    setBoard(newBoard);
    state.currCol++;
  }

  function removeLetter() {
    if (state.currCol === 0) return;
    const newBoard = [...board];
    newBoard[state.currRow][state.currCol - 1] = "";
    setBoard(newBoard);
    state.currCol--;
  }

  return (
    <div className={styles.wordle}>
      {modalOpen ? (
        <Modal
          modalText={modalMessage}
          buttonFunction={setModalOpen(false)}
          buttonText={modalButtonText}
        />
      ) : null}
      {dualModalOpen ? (
        <TwoButtonModal
          modalText={modalMessage}
          mainButtonLeft={true}
          leftButtonText={"Yes"}
          leftButtonFunction={saveScore}
          leftButtonFunctionParameters={
            {"amount": points, "private": false, "game": "wordle", "player": userId}
          }
          rightButtonText={"No"}
          rightButtonFunction={saveScore}
          rightButtonFunctionParameters={
            {"amount": points, "private": true, "game": "wordle", "player": userId}
          }
        />
      ) : null}
      <h1 className={`${styles.wordle__title}`}>Wordle</h1>
      {board.map((row, i) => (
        <div key={`row-${i}`} className={`${styles.wordle__row}`}>
          {row.map((column, j) => (
            <div
              key={`box-${i}-${j}`}
              id={`box-${i}-${j}`}
              className={`${styles.wordle__box}`}
            >
              {column}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Wordle;
