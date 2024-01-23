import React, { useState, useEffect, useRef } from "react";
import styles from "@/styles/games/Minesweeper.module.scss";
import Modal from "@/components/modals/modal";
import TwoButtonModal from "@/components/modals/twoButtonModal";
import postScore from "./postScore";
import { selectId } from "slices/authSlice";
import { useSelector } from "react-redux";

const ROWS = 16;
const COLS = 16;
const BOMBS = 40;

function createEmptyGrid() {
  const emptyGrid = [];
  for (let row = 0; row < ROWS; row++) {
    emptyGrid.push(new Array(COLS).fill(0));
  }
  return emptyGrid;
}

function generateBombs() {
  const bombArray = [];
  var i = 0;
  while (i < BOMBS) {
    const rand = Math.floor(Math.random() * (ROWS * COLS));
    if (!bombArray.includes(rand)) {
      bombArray.push(rand);
      i += 1;
    }
  }
  return bombArray;
}

function fillGridWithBombs() {
  const grid = createEmptyGrid();
  const bombs = generateBombs();
  var cellNumber = 0;
  for (let i = 0; i < ROWS; i++) {
    for (let y = 0; y < COLS; y++) {
      if (bombs.includes(cellNumber)) {
        grid[i][y] = -1;
      }
      cellNumber += 1;
    }
  }
  return grid;
}

function fillGridWithNumbers() {
  const grid = fillGridWithBombs();
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      if (grid[i][j] !== -1) {
        let count = 0;
        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
            if (
              i + x >= 0 &&
              i + x < ROWS &&
              j + y >= 0 &&
              j + y < COLS &&
              grid[i + x][j + y] === -1
            ) {
              count++;
            }
          }
        }
        grid[i][j] = count;
      }
    }
  }
  return grid;
}

export default function minesweeper() {
  const [grid, setGrid] = useState(fillGridWithNumbers());
  const [guessGrid, setGuessgrid] = useState(createEmptyGrid());
  const [bombsLeft, setBombsLeft] = useState(BOMBS);
  const [gameEnded, setGameEnded] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalButtonText, setModalButtonText] = useState("");
  const [dualModalOpen, setDualModalOpen] = useState(false);
  const id = useSelector(selectId);

  const saveScore = (amount, visible, game, playerid) => {
    postScore(amount, visible, game, playerid);
    setDualModalOpen(false);
  };

  const openModal = (modalMessage, modalButtonText) => {
    setModalMessage(modalMessage);
    setModalButtonText(modalButtonText);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const formattedTime = new Date(seconds * 1000)
    .toISOString()
    .substring(11, 19);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 1000);
    if (gameEnded == true) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [gameEnded]);

  useEffect(() => {
    if (!gameEnded) {
      checkIfEnd();
    }
  }, [guessGrid]);

  function checkIfEnd() {
    let isAll = true;
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (grid[i][j] > 0 && (guessGrid[i][j] == 0 || guessGrid[i][j] == -1)) {
          isAll = false;
        }
      }
    }
    if (isAll) {
      setGameEnded(true);
      revealGrid();
      setDualModalOpen(true);
    }
  }

  function restartGame() {
    setGrid(fillGridWithNumbers());
    setGuessgrid(createEmptyGrid());
    setBombsLeft(BOMBS);
    setGameEnded(false);
    setSeconds(0);
  }

  async function guess(i, y) {
    var newGuessGrid = guessGrid.map(function (arr) {
      return arr.slice();
    });
    newGuessGrid[i][y] = 1;
    setGuessgrid(newGuessGrid);
    await new Promise((r) => setTimeout(r, 100));
    if (grid[i][y] == 0) {
      setGuessgrid(revealNeighbours(i, y, guessGrid));
    }
    if (grid[i][y] == -1) {
      setGameEnded(true);
      revealGrid();
      openModal("You lost!", "OK");
    }
  }

  function revealGrid() {
    const revealedGrid = [];
    for (let row = 0; row < ROWS; row++) {
      revealedGrid.push(new Array(COLS).fill(1));
    }
    setGuessgrid(revealedGrid);
  }

  function revealNeighbours(i, j, newGuessGrid) {
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        if (i + x >= 0 && i + x < ROWS && j + y >= 0 && j + y < COLS) {
          if (newGuessGrid[i + x][j + y] == 0) {
            if (grid[i + x][j + y] > 0) {
              newGuessGrid[i + x][j + y] = 1;
            } else if (grid[i + x][j + y] == 0) {
              newGuessGrid[i + x][j + y] = 1;
              newGuessGrid = revealNeighbours(i + x, j + y, newGuessGrid);
            }
          }
        }
      }
    }
    return newGuessGrid;
  }

  function flag(event, i, y) {
    event.preventDefault();
    var newGuessGrid = guessGrid.map(function (arr) {
      return arr.slice();
    });
    let newBombAmount = bombsLeft - 1;
    if (newGuessGrid[i][y] == 0) {
      newGuessGrid[i][y] = -1;
      newBombAmount = bombsLeft - 1;
    } else {
      newGuessGrid[i][y] = 0;
      newBombAmount = bombsLeft + 1;
    }
    setGuessgrid(newGuessGrid);

    setBombsLeft(newBombAmount);
  }

  function handleContextMenu(event) {
    event.preventDefault();
  }

  return (
    <div className={styles.MinesweeperContainer}>
      {modalOpen ? (
        <Modal
          modalText={modalMessage}
          buttonFunction={closeModal}
          buttonText={modalButtonText}
        />
      ) : null}
      {dualModalOpen ? (
        <TwoButtonModal
          modalText={`Your time is ${seconds} seconds. Do You want to make this score public?`}
          mainButtonLeft={true}
          leftButtonText={"Yes"}
          leftButtonFunction={saveScore}
          leftButtonFunctionParameters={
            {"amount": seconds, "private": false, "game": "minesweeper", "player": id}
          }
          rightButtonText={"No"}
          rightButtonFunction={saveScore}
          rightButtonFunctionParameters={
            {"amount": seconds, "private": true, "game": "minesweeper", "player": id}
          }
        />
      ) : null}
      <div className={styles.MinesweeperBox}>
        <div className={styles.Game}>
          <div className={styles.Sidebar}>
            <div className={styles.Time}>⏰{formattedTime}</div>
            <div className={styles.Bombs}>🏁{bombsLeft}</div>
          </div>
          <div
            className={styles.MinesweeperGrid}
            onContextMenu={handleContextMenu}
          >
            {guessGrid.map((row, i) => (
              <div className={styles.MinesweeperRow} key={i}>
                {row.map((cell, y) => {
                  if (cell == 0) {
                    return (
                      <div
                        className={styles.MinesweeperCellHidden}
                        key={`${y} + ${i}`}
                      >
                        <button
                          disabled={gameEnded}
                          key={`${y} + ${i}`}
                          onClick={() => guess(i, y)}
                          onContextMenu={(e) => flag(e, i, y)}
                        ></button>
                      </div>
                    );
                  } else if (cell == -1) {
                    return (
                      <div
                        className={styles.MinesweeperCellFlag}
                        key={`${y} + ${i}`}
                      >
                        <button
                          disabled={gameEnded}
                          key={`${y} + ${i}`}
                          onContextMenu={(e) => flag(e, i, y)}
                        >
                          🏁
                        </button>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        className={styles.MinesweeperCellVisible}
                        key={`${y} + ${i}`}
                      >
                        {grid[i][y] === -1 ? (
                          <div className={styles.Bomb}>💣</div>
                        ) : grid[i][y] === 0 ? (
                          <div> </div>
                        ) : (
                          <div>{grid[i][y]}</div>
                        )}
                      </div>
                    );
                  }
                })}
              </div>
            ))}
          </div>
          <div className={styles.Sidebar}>
            <button
              className={styles.Start}
              disabled={!gameEnded}
              onClick={() => {
                setGameEnded(false), restartGame();
              }}
            >
              <div>Start Game</div>
            </button>
            <button
              className={styles.Start}
              disabled={gameEnded}
              onClick={() => {
                setGameEnded(false), restartGame();
              }}
            >
              <div>Restart Game</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
