import axios from "axios";
import { useEffect, useState } from "react";
import styles from "@/styles/MyGames.module.scss";
import Modal from "@/components/modals/modal";
import Link from "next/link";
import useAxios from "@/hooks/useAxios";
const apiUrl = process.env.SERVER_URL || "http://localhost:5000";

export default function Games() {
  const [games, setGames] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("Game created");
  const [modalButtonText, setModalButtonText] = useState("Redirect");

  const openModal = (modalMessage, modalButtonText) => {
    setModalMessage(modalMessage);
    setModalButtonText(modalButtonText);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const { data, isPending, error } = useAxios(`${apiUrl}/games/myGames`, true);
  useEffect(() => {
    if (games.length === 0 && data?.length > 0) {
      setGames(data);
    }
  }, [data]);

  const deleteGame = async (id) => {
    await axios
      .delete(`${apiUrl}/games/${id}`, { withCredentials: true })
      .then((response) => {
        setGames(games.filter((game) => game._id !== id));
      })
      .catch((err) => {
        openModal("Error when deleting game!", "Ok");
      });
  };

  if (isPending) {
    return (
      <main className={styles.MainContainerLoading}>
        <div className={styles.Dot} />
        <div className={styles.Dot} />
        <div className={styles.Dot} />
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.MainContainer}>
        <Modal
          modalText={error}
          buttonFunction={closeModal}
          buttonText={"Redirect to home"}
        />
      </main>
    );
  }

  return (
    <div className={styles.mygames}>
      {modalOpen ? (
        <Modal
          modalText={modalMessage}
          buttonFunction={closeModal}
          buttonText={modalButtonText}
        />
      ) : null}
      <div className={styles.mygames__title}>
        <h3>MY GAMES</h3>
        <div className={styles.mygames__statuses}>
          <div className={styles.mygames__status}>
            <span className={`${styles.game__status} ${styles.active}`}></span>
            <div>Active</div>
          </div>
          <div className={styles.mygames__status}>
            <span className={`${styles.game__status} ${styles.test}`}></span>
            <div>Being tested</div>
          </div>
          <div className={styles.mygames__status}>
            <span
              className={`${styles.game__status} ${styles.rejected}`}
            ></span>
            <div>Rejected</div>
          </div>
        </div>
      </div>
      <div className={styles.mygames__container}>
        {games.map((game) => (
          <div key={`${game._id}`} className={styles.game}>
            <div className={styles.game__title}>
              <div>{game.name}</div>
              <span
                className={`${styles.game__status} ${
                  game.status === "active" ? styles.active : null
                } ${game.status === "rejected" ? styles.rejected : null} ${
                  game.status === "test" ? styles.test : null
                }`}
              ></span>
            </div>
            <div className={styles.game__order}>Order: {game.order}</div>
            <div className={styles.game__compare}>
              El. to compare: {game.elementToCompare}
            </div>
            <div className={styles.game__buttons}>
              {game.status === "active" ? (
                <button
                  className={`${styles.game__button} ${styles.game__buttonTest}`}
                >
                  <Link href={`/ranking/byScore/${game._id}`}>SCORES</Link>
                </button>
              ) : null}
              {game.status === "rejected" ? (
                <button
                  className={`${styles.game__button} ${styles.game__buttonEdit}`}
                >
                  <Link href={`/games/edit/${game._id}`}>EDIT</Link>
                </button>
              ) : null}
              <button
                onClick={() => deleteGame(game._id)}
                className={`${styles.game__button} ${styles.game__buttonDelete}`}
              >
                DELETE
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
