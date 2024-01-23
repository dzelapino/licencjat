import React, { useState, useEffect } from "react";
import styles from "@/styles/games/Checkers.module.scss";
import { useSelector } from "react-redux";
import { selectId } from "slices/authSlice";
import TwoButtonModal from "@/components/modals/twoButtonModal";
import postScore from "./postScore";

const ROWS = 8;
const COLS = 8;

function createEmptyBoard() {
  const emptyBoard = [];
  for (let row = 0; row < ROWS; row++) {
    emptyBoard.push(new Array(COLS).fill(0));
  }
  return emptyBoard;
}

function placePawns() {
  const board = createEmptyBoard();
  for (let i = 0; i < board.length; i++) {
    for (let y = 0; y < board[i].length; y++) {
      if ((i % 2 != 0 && y % 2 == 0) || (i % 2 != 1 && y % 2 == 1)) {
        if (i <= 2) {
          board[i][y] = 1;
        }
        if (i >= 5) {
          board[i][y] = 2;
        }
      }
    }
  }
  return board;
}

function ifPawnIsSelected(state) {
  if (state.length > 0) {
    return true;
  }
  return false;
}

export default function checkers() {
  const [board, setBoard] = useState(placePawns());
  const [currentPawn, setCurrentPawn] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState("Blue");
  const [bluePawnsLeft, setBluePawnsLeft] = useState(12);
  const [redPawnsLeft, setRedPawnsLeft] = useState(12);
  const [gameEnded, setGameEnded] = useState(true);
  const [dualModalWinner, setDualModalWinner] = useState("");
  const [dualModalScore, setDualModalScore] = useState("");
  const [dualModalOpen, setDualModalOpen] = useState(false);
  const id = useSelector(selectId);

  useEffect(() => {
    if (bluePawnsLeft == 0) {
      setGameEnded();
      endGame('red', redPawnsLeft)
    }
  }, [bluePawnsLeft]);

  useEffect(() => {
    if (redPawnsLeft == 0) {
      setGameEnded();
      endGame('blue', bluePawnsLeft)
    }
  }, [redPawnsLeft]);

  function restartGame() {
    setBoard(placePawns());
    setCurrentPawn([]);
    setCurrentPlayer("Blue");
    setBluePawnsLeft(12);
    setRedPawnsLeft(12);
  }

  function endGame(winner, score){
    setGameEnded(true);
    setDualModalWinner(winner)
    setDualModalScore(score)
    setDualModalOpen(true);
    restartGame();
  }

  const saveScore = (amount, visible, game, playerid) => {
    postScore(amount, visible, game, playerid);
    setDualModalOpen(false);
  };

  function movePawn(i, y) {
    if (ifPawnIsSelected(currentPawn)) {
      if (isMovePossible(i, y)) {
        let newBoard = board.map(function (arr) {
          return arr.slice();
        });
        var newPawn = newBoard[currentPawn[0]][currentPawn[1]];
        if (canBePromoted(i)) {
          newPawn += 2;
        }
        newBoard[i][y] = newPawn;
        newBoard[currentPawn[0]][currentPawn[1]] = 0;
        if (
          Math.abs(i - currentPawn[0]) == 2 &&
          Math.abs(y - currentPawn[1]) == 2
        ) {
          newBoard[(i + currentPawn[0]) / 2][(y + currentPawn[1]) / 2] = 0;
          if (currentPlayer == "Red") {
            setBluePawnsLeft(bluePawnsLeft - 1);
          } else if (currentPlayer == "Blue") {
            setRedPawnsLeft(redPawnsLeft - 1);
          }
        }
        setBoard(newBoard);
        setCurrentPawn([]);
        changeTurn();
      }
    }
  }

  function isMovePossible(i, y) {
    const moves = possibleMoves(
      board[currentPawn[0]][currentPawn[1]],
      currentPawn[0],
      currentPawn[1]
    );
    for (const move of moves) {
      if (move[0] == i && move[1] == y) {
        return true;
      }
    }
    return false;
  }

  function possibleMoves(pawnValue, i, y) {
    if (canCapture(pawnValue, i, y).length > 0) {
      return canCapture(pawnValue, i, y);
    }
    return canMove(pawnValue, i, y);
  }

  function canCapture(pawnValue, i, y) {
    const moves = [];
    if ((isPawnRed(pawnValue) || pawnValue == 4) && i + 2 < ROWS) {
      if (y - 2 >= 0) {
        if (
          board[i + 1][y - 1] % 2 != pawnValue % 2 &&
          board[i + 1][y - 1] != 0
        ) {
          if (board[i + 2][y - 2] === 0) {
            moves.push([i + 2, y - 2]);
          }
        }
      }
      if (y + 2 < COLS) {
        if (
          board[i + 1][y + 1] % 2 != pawnValue % 2 &&
          board[i + 1][y + 1] != 0
        ) {
          if (board[i + 2][y + 2] === 0) {
            moves.push([i + 2, y + 2]);
          }
        }
      }
    }

    if ((isPawnBlue(pawnValue) || pawnValue == 3) && i - 2 >= 0) {
      if (y - 2 >= 0) {
        if (
          board[i - 1][y - 1] % 2 != pawnValue % 2 &&
          board[i - 1][y - 1] != 0
        ) {
          if (board[i - 2][y - 2] === 0) {
            moves.push([i - 2, y - 2]);
          }
        }
      }
      if (y + 2 < COLS) {
        if (
          board[i - 1][y + 1] % 2 != pawnValue % 2 &&
          board[i - 1][y + 1] != 0
        ) {
          if (board[i - 2][y + 2] === 0) {
            moves.push([i - 2, y + 2]);
          }
        }
      }
    }
    return moves;
  }

  function isPawnRed(value) {
    if (value === 1 || value === 3) {
      return true;
    }
    return false;
  }

  function isPawnBlue(value) {
    if (value === 2 || value === 4) {
      return true;
    }
    return false;
  }

  function canMove(pawnValue, i, y) {
    const moves = [];
    if ((isPawnRed(pawnValue) || pawnValue === 4) && i + 1 < ROWS) {
      if (y - 1 >= 0) {
        if (board[i + 1][y - 1] === 0) {
          moves.push([i + 1, y - 1]);
        }
      }
      if (y + 1 < COLS) {
        if (board[i + 1][y + 1] === 0) {
          moves.push([i + 1, y + 1]);
        }
      }
    }
    if ((isPawnBlue(pawnValue) || pawnValue === 3) && i - 1 >= 0) {
      if (y - 1 >= 0) {
        if (board[i - 1][y - 1] === 0) {
          moves.push([i - 1, y - 1]);
        }
      }
      if (y + 1 < COLS) {
        if (board[i - 1][y + 1] === 0) {
          moves.push([i - 1, y + 1]);
        }
      }
    }
    return moves;
  }

  function changeTurn() {
    if (currentPlayer == "Blue") {
      setCurrentPlayer("Red");
    } else {
      setCurrentPlayer("Blue");
    }
  }

  function setPawn(i, y) {
    if (board[i][y] != 0 && chceckPlayerTurn(i, y)) {
      setCurrentPawn([i, y]);
    }
  }

  function canBePromoted(i, y) {
    if (currentPlayer == "Red" && i == ROWS - 1) {
      return true;
    }
    if (currentPlayer == "Blue" && i == 0) {
      return true;
    }
    return false;
  }

  function chceckPlayerTurn(i, y) {
    if ((board[i][y] == 1 || board[i][y] == 3) && currentPlayer == "Red") {
      return true;
    }
    if ((board[i][y] == 2 || board[i][y] == 4) && currentPlayer == "Blue") {
      return true;
    }
    return false;
  }

  function pawnPosition() {
    if (ifPawnIsSelected(currentPawn)) {
      return (
        String.fromCharCode(65 + currentPawn[1]) +
        String.fromCharCode(56 - currentPawn[0])
      );
    }
    return "None";
  }

  return (
    <div className={styles.CheckersContainer}>
      {dualModalOpen ? (
        <TwoButtonModal
          modalText={`${dualModalWinner} won with ${dualModalScore} pieces left! Do You want to make this score public?`}
          mainButtonLeft={true}
          leftButtonText={"Yes"}
          leftButtonFunction={saveScore}
          leftButtonFunctionParameters={
            {"amount": dualModalScore, "private": false, "game": "checkers", "player": id}
          }
          rightButtonText={"No"}
          rightButtonFunction={saveScore}
          rightButtonFunctionParameters={
            {"amount": dualModalScore, "private": true, "game": "checkers", "player": id}
          }
        />
      ) : null}
      <div className={styles.CheckersBox}>
        <div className={styles.Game}>
          <div className={styles.MainBar}>
            <div className={styles.LeftBar}>
              <div className={styles.LeftBarValue}>1</div>
              <div className={styles.LeftBarValue}>2</div>
              <div className={styles.LeftBarValue}>3</div>
              <div className={styles.LeftBarValue}>4</div>
              <div className={styles.LeftBarValue}>5</div>
              <div className={styles.LeftBarValue}>6</div>
              <div className={styles.LeftBarValue}>7</div>
              <div className={styles.LeftBarValue}>8</div>
            </div>
            <div className={styles.CheckersGrid}>
              {board.map((row, i) => (
                <div className={styles.CheckersRow} key={i}>
                  {row.map((cell, y) => {
                    if (
                      (i % 2 == 0 && y % 2 == 0) ||
                      (i % 2 == 1 && y % 2 == 1)
                    ) {
                      return (
                        <div
                          className={styles.CheckersCellWhite}
                          key={`${y} + ${i}`}
                        ></div>
                      );
                    } else {
                      return (
                        <div
                          className={styles.CheckersCellBlack}
                          onClick={() => movePawn(i, y)}
                          key={`${y} + ${i}`}
                        >
                          <div
                            className={`${styles.CheckersPawn} ${
                              styles[`CheckersPawn-${cell}`]
                            }`}
                            onClick={() => setPawn(i, y)}
                          >
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              ))}
            </div>
            <div className={styles.RightBar}>
              <div className={styles.RedPawnsLeft}>
                PawnsLeft:
                <div className={styles.BluePawnsLeftAmount}>{redPawnsLeft}</div>
              </div>
              <div className={styles.CurrentPlayer}>
                Player:
                <div className={`${styles[currentPlayer]}`}>
                </div>
              </div>
              <div className={styles.SelectedPawn}>
                Selected Pawn:
                <div className={styles.SelectedPawnPosition}>{pawnPosition()}</div>
              </div>
              <div className={styles.BluePawnsLeft}>
                PawnsLeft:
                <div className={styles.BluePawnsLeftAmount}>{bluePawnsLeft}</div>
              </div>
            </div>
          </div>
          <div className={styles.LowerBar}>
            <div className={styles.LowerBarValue}>A</div>
            <div className={styles.LowerBarValue}>B</div>
            <div className={styles.LowerBarValue}>C</div>
            <div className={styles.LowerBarValue}>D</div>
            <div className={styles.LowerBarValue}>E</div>
            <div className={styles.LowerBarValue}>F</div>
            <div className={styles.LowerBarValue}>G</div>
            <div className={styles.LowerBarValue}>H</div>
          </div>
        </div>
      </div>
    </div>
  );
}