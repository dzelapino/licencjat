import axios from "axios";
import { useState, useEffect } from "react";
import styles from "@/styles/MyGames.module.scss";
import Modal from "@/components/modals/modal";
import ThreeButtonModal from "@/components/modals/threeButtonModal";
import { useSelector, useDispatch } from "react-redux";
import {
  selectGamesState,
  setGamesState,
  addGamesToState,
} from "slices/gamesSlice";
import Router from "next/router";
import Button from "@/components/buttons/button";
const apiUrl = process.env.SERVER_URL || "http://localhost:5000";

export default function RankingGameList() {
  const gamesApiUrl = `${apiUrl}/games`;
  const stateGames = useSelector(selectGamesState);
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pageToFetch, setPageToFetch] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCloseErrorFlag, setModalCloseErrorFlag] = useState(false);
  const [modalMessage, setModalMessage] = useState("Load successful");
  const [modalButtonText, setModalButtonText] = useState("Close");
  const [threeButtonModalOpen, setThreeButtonModalOpen] = useState(false);
  const [currentGameId, setCurrentGameId] = useState(null);

  const openModal = (modalMessage, modalButtonText) => {
    setModalMessage(modalMessage);
    setModalButtonText(modalButtonText);
    setModalOpen(true);
  };

  const closeModal = () => {
    modalCloseErrorFlag ? Router.push("/") : setModalOpen(false);
  };

  const openThreeButtonModal = (id) => {
    setCurrentGameId(id);
    setThreeButtonModalOpen(true);
  };

  const closeThreeButtonModal = () => {
    setCurrentGameId(null);
    setThreeButtonModalOpen(false);
  };

  const redirectToSortingView = (url) => {
    Router.push(url);
  };

  useEffect(() => {
    try {
      fetchPageNumbers();
      fetchGames();
    } catch (error) {
      setModalCloseErrorFlag(true);
      openModal("Error while fetching data.", "Redirect to view");
    }
    async function fetchPageNumbers() {
      try {
        await axios.get(`${gamesApiUrl}/pages`).then((response) => {
          setPages(response.data.size);
        });
      } catch (error) {
        setModalCloseErrorFlag(true);
        openModal("Error while fetching data.", "Redirect to view");
      }
    }

    async function fetchGames() {
      try {
        await axios.get(`${gamesApiUrl}/byPage/1`).then((response) => {
          dispatch(setGamesState([{ page: 1, gamesList: response.data }]));
        });
      } catch (error) {
        setModalCloseErrorFlag(true);
        openModal("Error while fetching data.", "Redirect to view");
      }
    }
  }, [gamesApiUrl, dispatch]);

  const fetchGamesByPage = async (page) => {
    if (!stateGames.find((gamesPerPage) => gamesPerPage.page === page)) {
      await axios.get(`${gamesApiUrl}/byPage/${page}`).then((response) => {
        const gameFromPage = { page: page, gamesList: response.data };
        dispatch(addGamesToState(gameFromPage));
      });
    }
    setCurrentPage(page);
    setPageToFetch(page);
  };

  const PageButtonsWrapper = ({ maxPages }) => {
    return (
      <div className={styles.PageButtonsWrapper}>
        <div className={styles.CurrentPageDisplay}>
          Current page: {currentPage}
        </div>
        <div className={styles.ButtonsWrapper}>
          {maxPages - 2 > 0 ? (
            <div className={styles.PageButtonsRender}>
              <Button
                buttonFunction={fetchGamesByPage}
                buttonFunctionParameters={1}
                buttonText={1}
              />

              {currentPage - 1 > 1 ? (
                <Button
                  buttonFunction={fetchGamesByPage}
                  buttonFunctionParameters={currentPage - 1}
                  buttonText={currentPage - 1}
                />
              ) : null}
              {currentPage > 1 && currentPage < maxPages ? (
                <Button
                  buttonFunction={fetchGamesByPage}
                  buttonFunctionParameters={currentPage}
                  buttonText={currentPage}
                />
              ) : null}
              {currentPage + 1 < maxPages ? (
                <Button
                  buttonFunction={fetchGamesByPage}
                  buttonFunctionParameters={currentPage + 1}
                  buttonText={currentPage + 1}
                />
              ) : null}

              <Button
                buttonFunction={fetchGamesByPage}
                buttonFunctionParameters={maxPages}
                buttonText={maxPages}
              />
            </div>
          ) : (
            <div className={styles.PageButtonsRender}>
              <Button
                buttonFunction={fetchGamesByPage}
                buttonFunctionParameters={1}
                buttonText={1}
              />
              {maxPages - 2 === 0 ? (
                <Button
                  buttonFunction={fetchGamesByPage}
                  buttonFunctionParameters={maxPages}
                  buttonText={maxPages}
                />
              ) : null}
            </div>
          )}
        </div>
      </div>
    );
  };

  const PageJumper = ({ maxPages }) => {
    return (
      <div className={styles.PageJumper}>
        <div className={styles.PageJumperValueWrapper}>
          <button
            className={styles.ArrowButton}
            onClick={() => {
              {
                pageToFetch > 1
                  ? setPageToFetch(pageToFetch - 1)
                  : setPageToFetch(1);
              }
            }}
          >
            <div>↓</div>
          </button>
          <input
            className={styles.PageSelect}
            type="number"
            min="1"
            max={maxPages}
            defaultValue={pageToFetch}
            onChange={(e) => {
              if (e.target.value >= 1 && e.target.value <= maxPages) {
                setPageToFetch(e.target.value);
              } else {
                setPageToFetch(maxPages);
              }
            }}
          />
          <button
            className={styles.ArrowButton}
            onClick={() => {
              {
                pageToFetch < maxPages
                  ? setPageToFetch(pageToFetch + 1)
                  : setPageToFetch(maxPages);
              }
            }}
          >
            <div>↑</div>
          </button>
        </div>
        <button
          className={styles.PageButton}
          onClick={() => fetchGamesByPage(pageToFetch)}
        >
          Change page
        </button>
      </div>
    );
  };

  if (!stateGames.find((games) => games.page === currentPage)) {
    return (
      <main className={styles.MainContainerLoading}>
        {modalOpen ? (
          <Modal
            modalText={modalMessage}
            buttonFunction={closeModal}
            buttonText={modalButtonText}
          />
        ) : null}

        <div className={styles.Dot} />
        <div className={styles.Dot} />
        <div className={styles.Dot} />
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

      {threeButtonModalOpen ? (
        <ThreeButtonModal
          modalText={"Choose ranking type"}
          mainButtonFunction={closeThreeButtonModal}
          mainButtonText={"Close"}
          secondButtonFunction={redirectToSortingView}
          secondButtonText={"Date"}
          secondButtonFunctionParameters={`/ranking/byDate/${currentGameId}`}
          thirdButtonFunction={redirectToSortingView}
          thirdButtonText={"Table"}
          thirdButtonFunctionParameters={`/ranking/byScore/${currentGameId}`}
        />
      ) : null}

      <div className={styles.mygames__top}>
        <div
          className={styles.mygames__title}
        >
          <PageButtonsWrapper maxPages={pages} />
          <div className={styles.mygames__statuses}>
            <div className={styles.mygames__status}>
              <span className={`${styles.game__status} ${styles.active}`} />
              <div>Active</div>
            </div>
            <div className={styles.mygames__status}>
              <span className={`${styles.game__status} ${styles.test}`} />
              <div>Being tested</div>
            </div>
            <div className={styles.mygames__status}>
              <span className={`${styles.game__status} ${styles.rejected}`} />
              <div>Rejected</div>
            </div>
          </div>
        </div>
        <div className={styles.mygames__container}>
          {stateGames
            .find((games) => games.page === currentPage)
            .gamesList.map((game, index) => (
              <div
                key={index}
                className={`${styles.game} ${styles.mygames__ranking__tile}`}
                onClick={() => openThreeButtonModal(game._id)}
              >
                <div className={`${styles.game__title}`}>
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
              </div>
            ))}
        </div>
      </div>
      <div>
        <PageJumper maxPages={pages} />
      </div>
    </div>
  );
}
