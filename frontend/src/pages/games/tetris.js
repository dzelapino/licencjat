import React, { useState, useEffect, useRef } from "react";
import styles from "@/styles/games/Tetris.module.scss";
import postScore from "./postScore";
import TwoButtonModal from "@/components/modals/twoButtonModal";
import Button from "@/components/buttons/button";
import { selectId } from "slices/authSlice";
import { useSelector } from "react-redux";

const ROWS = 20;
const COLS = 10;

function generateNewTetromino() {
  const tetrominoes = [
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ], // Z shape
    [
      [0, 2, 2],
      [2, 2, 0],
      [0, 0, 0],
    ], // S shape
    [
      [0, 3, 0],
      [3, 3, 3],
      [0, 0, 0],
    ], // T shape
    [[4, 4, 4, 4]], // I shape
    [
      [5, 5],
      [5, 5],
    ], // O shape
    [
      [6, 0, 0],
      [6, 6, 6],
      [0, 0, 0],
    ], // L shape
    [
      [0, 0, 7],
      [7, 7, 7],
      [0, 0, 0],
    ], // J shape
  ];
  const randomShape =
    tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
  const newTetromino = {
    shape: randomShape,
    position: { x: Math.floor(COLS / 2) - 1, y: 0 },
  };
  return newTetromino;
}

function useInterval(callback, delay) {
  const callbackRef = useRef();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const interval = setInterval(() => callbackRef.current(), delay);
    if (delay == null) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [delay]);
}

function createEmptyGrid(ROWS, COLS) {
  const emptyGrid = [];
  for (let row = 0; row < ROWS; row++) {
    emptyGrid.push(new Array(COLS).fill(0));
  }
  return emptyGrid;
}

function addTetrominoToGrid(myTetromino, myGrid) {
  let result = myGrid.map(function (arr) {
    return arr.slice();
  });
  const { shape, position } = myTetromino;
  const value = findTetrominoValue(myTetromino);
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== 0) {
        result[y + position.y][x + position.x] = value;
      }
    }
  }
  return result;
}

function findTetrominoValue(myTetromino) {
  const shape = myTetromino.shape;
  let value = 0;
  for (let i = 0; i < shape.length; i++) {
    for (let y = 0; y < shape[i].length; y++) {
      if (shape[i][y] != 0) {
        value = shape[i][y];
        break;
      }
    }
  }
  return value;
}

export default function tetris() {
  const [oldGrid, setOldGrid] = useState(createEmptyGrid(ROWS, COLS));
  const [tetromino, setTetromino] = useState(generateNewTetromino());
  const [grid, setGrid] = useState(createEmptyGrid(ROWS, COLS));
  const [gameEnded, setGameEnded] = useState(true);
  const [score, setScore] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const id = useSelector(selectId);

  const saveScore = (data) => {
    postScore(data);
    setModalOpen(false);
    restartGame();
  };

  const eBoard = useRef();

  useEffect(updateGrid, [oldGrid, tetromino]);
  useEffect(removeFullRow, [oldGrid]);

  useInterval(tick, gameEnded ? null : 600);

  function updateGrid() {
    const newGrid = addTetrominoToGrid(tetromino, oldGrid);
    setGrid(newGrid);
  }

  function tick() {
    if (!moveTetromino(0, 1)) {
      placeTetromino();
    }
  }

  function placeTetromino() {
    if (validPosition(tetromino)) {
      setOldGrid(addTetrominoToGrid(tetromino, oldGrid));
      setTetromino(generateNewTetromino());
    } else {
      setGameEnded(true);
      setModalOpen(true);
    }
  }

  function onKeyDown(event) {
    if (gameEnded) {
      return;
    }
    switch (event.key) {
      case "ArrowRight":
        moveTetromino(1, 0);
        event.preventDefault();
        break;
      case "ArrowLeft":
        moveTetromino(-1, 0);
        event.preventDefault();
        break;
      case "ArrowDown":
        moveTetromino(0, 1);
        event.preventDefault();
        break;
      case "ArrowUp":
        rotateShape();
        event.preventDefault();
        break;
      default:
        break;
    }
  }

  function rotateShape() {
    const rotated = tetromino.shape[0].map((val, index) =>
      tetromino.shape.map((row) => row[index]).reverse()
    );
    const newTetromino = {
      shape: rotated,
      position: tetromino.position,
    };

    if (validPosition(newTetromino)) {
      setTetromino(newTetromino);
    }
  }

  function moveTetromino(x, y) {
    const newTetromino = structuredClone(tetromino);
    newTetromino.position.x += x;
    newTetromino.position.y += y;
    if (!validPosition(newTetromino)) {
      return false;
    }
    setTetromino(newTetromino);
    return true;
  }

  function validPosition(newTetromino) {
    let isValid = true;
    for (let i = 0; i < newTetromino.shape.length; i++) {
      for (let y = 0; y < newTetromino.shape[i].length; y++) {
        if (newTetromino.shape[i][y] != 0) {
          if (
            newTetromino.position.y + i > ROWS - 1 ||
            newTetromino.position.y + i < 0
          ) {
            isValid = false;
            break;
          }
          if (
            newTetromino.position.x + y > COLS - 1 ||
            newTetromino.position.x + y < 0
          ) {
            isValid = false;
            break;
          }
          if (
            oldGrid[newTetromino.position.y + i][newTetromino.position.x + y] !=
            0
          ) {
            isValid = false;
            break;
          }
        }
      }
    }
    return isValid;
  }

  function removeFullRow() {
    let newScene = oldGrid.map(function (arr) {
      return arr.slice();
    });
    let touched = false;

    const removeRow = (rY) => {
      for (let y = rY; y > 0; y--) {
        for (let x = 0; x < COLS - 1; x++) {
          newScene[y][x] = newScene[y - 1][x];
        }
      }
      for (let x = 0; x < COLS - 1; x++) {
        newScene[0][x] = 0;
      }

      touched = true;
      setScore((oldVal) => oldVal + 1000);
    };

    for (let y = 0; y < ROWS; y++) {
      let rowHasEmptySpace = false;
      for (let x = 0; x < COLS; x++) {
        if (newScene[y][x] === 0) {
          rowHasEmptySpace = true;
          break;
        }
      }
      if (!rowHasEmptySpace) {
        removeRow(y);
      }
    }

    if (touched) {
      setOldGrid(newScene);
    }
  }

  function restartGame() {
    setOldGrid(createEmptyGrid(ROWS, COLS));
    setTetromino(generateNewTetromino());
    setGrid(createEmptyGrid(ROWS, COLS));
    setGameEnded(true);
    setScore(0);
  }

  function startGame(gameStatus) {
      setGameEnded(gameStatus);
      document.getElementById("row1").focus();
  }

  let clickEvent = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: 20,
  });

  return (
    <div className={styles.TetrisContainer} tabIndex={0} onKeyDown={onKeyDown}>
      {modalOpen ? (
        <TwoButtonModal
          modalText={`Your score is ${score}. Do You want to make this score public?`}
          mainButtonLeft={true}
          leftButtonText={"Yes"}
          leftButtonFunction={saveScore}
          leftButtonFunctionParameters={
            {"amount": score, "private": false, "game": "tetris", "player": id}
          }
          rightButtonText={"No"}
          rightButtonFunction={saveScore}
          rightButtonFunctionParameters={
            {"amount": score, "private": true, "game": "tetris", "player": id}
          }
        />
      ) : null}
      <div className={styles.TetrisBox}>
        <div className={styles.Game}>
          <div ref={eBoard} className={styles.TetrisGrid}>
            {grid.map((row, i) => (
              <div id={"row" + i} className={styles.TetrisRow} key={i} tabindex="-1">
                {row.map((cell, y) => (
                  <div
                    className={`${styles.TetrisCell} ${
                      styles[`TetrisCellFull-${cell}`]
                    }`}
                    key={`${y} + ${i}`}
                  ></div>
                ))}
              </div>
            ))}
            <div className={styles.Sidebar}>
            <p className={styles.Score}>{score}</p>
            <Button
          buttonFunction={startGame}
          buttonFunctionParameters={false}
          buttonText={"Start Game"}
          disabled={!gameEnded}/>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
