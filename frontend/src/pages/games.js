import styles from "../styles/GamesList.module.scss";
import axios from "axios";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";
const serverUrl = "localhost:5000";
export default function Games() {
  const builtInGames = [
    "geozgadywacz",
    "tetris",
    "minesweeper",
    "wordle",
    "hangman",
    "checkers",
  ];
  const gamesApiUrl = `http://${serverUrl}/games`;
  const [games, setGames] = useState([]);
  const getGames = async () => {
    await axios
      .get(gamesApiUrl, { withCredentials: true })
      .then((response) => {
        console.log(response.data);
        setGames(
          response.data.filter(
            (game) =>
              game.status === "active" && !builtInGames.includes(game.name)
          )
        );
      })
      .catch((err) => {
        alert(err);
        alert("Error when getting games!");
      });
  };

  useEffect(
    () => {
      if (games.length === 0) {
        getGames();
      }
    },
    games,
    getGames
  );

  return (
    <div className={styles.games_list__component}>
      <div className={styles.games_list__content}>
        <h1 className={styles.games_list__title}>Games</h1>
        <div className={styles.games_list__table}>
          <Link href="/games/wordle" className={styles.games_list__game}>
            <div>Wordle</div>
          </Link>
          <Link href="/games/hangman" className={styles.games_list__game}>
            <div>Hangman</div>
          </Link>
          <Link href="/games/tetris" className={styles.games_list__game}>
            <div>Tetris</div>
          </Link>
          <Link href="/games/minesweeper" className={styles.games_list__game}>
            <div>Minesweeper</div>
          </Link>
          <Link href="/games/checkers" className={styles.games_list__game}>
            <div>Checkers</div>
          </Link>
          <Link
            href={`/games/geozgadywacz?id=${uuidv4()}`}
            className={styles.games_list__game}
          >
            <div>GeoZgadywacz</div>
          </Link>
          <Link
            href="/createGame/info"
            className={`${styles.games_list__game} ${styles.games_list__add}`}
          >
            <div>CREATE NEW</div>
          </Link>
        </div>
        <div className={styles.games_list__separator}></div>
        <div className={styles.games_list__table}>
          {games.length > 0
            ? games.map((game) => (
                <Link
                  key={game.name}
                  href={`/games/${game.name}`}
                  className={styles.games_list__game}
                >
                  {game.name}
                </Link>
              ))
            : null}
        </div>
      </div>
    </div>
  );
}
