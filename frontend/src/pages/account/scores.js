import axios from "axios";
import { useState, useEffect } from "react";
import styles from "@/styles/MyScores.module.scss";
import Modal from "@/components/modals/modal";

const serverUrl = process.env.SERVER_URL || "http://localhost:5000";

export default function MyScores() {

  const [scores, setScores] = useState([[]]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("Game created");
  const [modalButtonText, setModalButtonText] = useState("Redirect");

  const openModal = (modalMessage, modalButtonText) => {
    setModalMessage(modalMessage)
    setModalButtonText(modalButtonText)
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false)
  };

  useEffect(() => {
    getScores();
  }, []);

  const getScores = async () => {
    await axios
      .get(
        `${serverUrl}/scores/myScores`,
        { withCredentials: true }
      )
      .then((response) => {
        setScores(response.data);
      })
      .catch((err) => {
        openModal("Error when getting games!", "Ok");
      });
  };

  const reformatDate = (date) => {
    var wynik = new Date(date).toLocaleString('en-GB')
    return <div className={styles.Box}>{wynik}</div>
  }


  return (
    <div className={styles.MyScoresContainer}>
      {modalOpen ?
        <Modal modalText={modalMessage} buttonFunction={closeModal} buttonText={modalButtonText} />
        : null}
      <div className={styles.MyScoresList}>
        <h1>My Scores</h1>
        <div className={styles.Table}>
          <div className={styles.Row}>
            <div className={styles.Label}>
              Score
            </div>
            <div className={styles.Label}>
              Date
            </div>
            <div className={styles.Label}>
              Game
            </div>
          </div>
          {scores.map((score, i) => (
            <div className={styles.Row} key={i}>
              <div className={styles.Box}>
                {score.amount}
              </div>
              {reformatDate(score.date)}
              <div className={styles.Box}>
                {score.game}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
};