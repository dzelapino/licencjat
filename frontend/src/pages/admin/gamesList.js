import axios from "axios";
import { useState, useEffect } from "react";
import styles from "@/styles/MyGames.module.scss";
import Link from "next/link";
import {
  selectGamesState,
  setGamesState,
  deleteGameFromState,
  addGamesToState,
} from "slices/gamesSlice";
import Router from "next/router";
import { useSelector, useDispatch } from "react-redux";
import io from "socket.io-client";
import Button from "@/components/buttons/button";
import Modal from "@/components/modals/modal";
import TwoButtonModal from "@/components/modals/twoButtonModal";
import { builtInGames } from "../../../public/builtInGames";

const serverUrl = process.env.SERVER_URL || "http://localhost:5000";

export default function GamesList() {
  const [games, setGames] = useState([[]]);
  const gamesApiUrl = `${serverUrl}/games`;
  const stateGames = useSelector(selectGamesState);
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pageToFetch, setPageToFetch] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCloseErrorFlag, setModalCloseErrorFlag] = useState(false);
  const [modalMessage, setModalMessage] = useState("Load successful");
  const [modalButtonText, setModalButtonText] = useState("Close");
  const [twoButtonModalOpen, setTwoButtonModalOpen] = useState(false);
  const [gameToDeleteById, setGameToDeleteById] = useState(null);

  useEffect(() => {
    getGames();
  }, []);

  const getGames = async () => {
    await axios
      .get(gamesApiUrl, { withCredentials: true })
      .then((response) => {
        setGames(response.data);
      })
      .catch((err) => {
        alert(err);
        alert("Error when getting games!");
      });
  };

  const openModal = (modalMessage, modalButtonText) => {
    setModalMessage(modalMessage);
    setModalButtonText(modalButtonText);
    setModalOpen(true);
  };

  const closeModal = () => {
    modalCloseErrorFlag ? Router.push("/admin/view") : setModalOpen(false);
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
      await axios.get(`${gamesApiUrl}/pages`).then((response) => {
        setPages(response.data.size);
      });
    }

    async function fetchGames() {
      await axios.get(`${gamesApiUrl}/byPage/1`).then((response) => {
        dispatch(setGamesState([{ page: 1, gamesList: response.data }]));
      });
    }
  }, [gamesApiUrl, dispatch]);

  const beginDeletingGame = (id) => {
    setGameToDeleteById(id);
    setTwoButtonModalOpen(true);
  };

  const abortDeletingGame = () => {
    setGameToDeleteById(null);
    setTwoButtonModalOpen(false);
  };

  const deleteGame = async ({ id, page }) => {
    setTwoButtonModalOpen(false);
    await axios
      .delete(
        `${gamesApiUrl}/${id}`,
        {},
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        dispatch(deleteGameFromState({ id, page }));
        openModal(response.data.message.msgBody, "Close");
      })
      .catch((err) => {
        openModal("Error while deleting game.", "Ok");
      });
  };

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
            step="1"
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

      {twoButtonModalOpen ? (
        <TwoButtonModal
          modalText={`Are you sure that you want to ${
            userToToggleStatus ? "activate" : "disable"
          } that user?`}
          mainButtonLeft={true}
          leftButtonText={`Don't ${
            userToToggleStatus ? "activate" : "disable"
          }`}
          leftButtonFunction={abortTogglingUser}
          rightButtonText={`${userToToggleStatus ? "Activate" : "Disable"}`}
          rightButtonFunction={toggleAccount}
          rightButtonFunctionParameters={{
            id: userToToggleById,
            page: currentPage,
          }}
        />
      ) : null}

      <div className={styles.mygames__top}>
        <div className={styles.mygames__title}>
          <PageButtonsWrapper maxPages={pages} />
          <div className={styles.mygames__statuses}>
            <div className={styles.mygames__status}>
              <span
                className={`${styles.game__status} ${styles.active}`}
              ></span>
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
          {stateGames
            .find((games) => games.page === currentPage)
            .gamesList.map((game, index) => (
              <div key={index} className={styles.game}>
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
                {!builtInGames.includes(game.name) && (
                  <div className={styles.game__buttons}>
                    <Link
                      className={`${styles.game__button} ${styles.game__buttonTest}`}
                      href={`/games/edit/${game._id}`}
                    >
                      TEST
                    </Link>
                    {/* {game.status !== "active" ? ( */}
                    <Link
                      className={`${styles.game__button} ${styles.game__buttonEdit}`}
                      href={`/games/edit/${game._id}`}
                    >
                      EDIT
                    </Link>
                  </div>
                )}
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
