import styles from "@/styles/admin/View.module.scss";
import axios from "axios";
import { useEffect, useState } from "react";
import Gravatar from "react-gravatar";
import Router from "next/router";
import { useSelector, useDispatch } from "react-redux";
import {
  selectUsersState,
  setUsersState,
  toggleUserStatus,
  addUsersToState,
} from "slices/usersSlice";
import io from "socket.io-client";
import Button from "@/components/buttons/button";
import Modal from "@/components/modals/modal";
import TwoButtonModal from "@/components/modals/twoButtonModal";

const serverUrl = process.env.SERVER_URL || "http://localhost:5000";
const socketUrl = process.env.WEBSOCKET_URL || "ws://localhost:5000";
const socket = io(socketUrl);

export default function UserList() {
  const usersApiUrl = `${serverUrl}/users`;
  const stateUsers = useSelector(selectUsersState);
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pageToFetch, setPageToFetch] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCloseErrorFlag, setModalCloseErrorFlag] = useState(false);
  const [modalMessage, setModalMessage] = useState("Load successful");
  const [modalButtonText, setModalButtonText] = useState("Close");
  const [twoButtonModalOpen, setTwoButtonModalOpen] = useState(false);
  const [userToToggleById, setUserToToggleById] = useState(null);
  const [userToToggleStatus, setUserToToggleStatus] = useState(false);

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
      fetchUsers();
    } catch (error) {
      setModalCloseErrorFlag(true);
      openModal("Error while fetching data.", "Redirect to view");
    }

    async function fetchPageNumbers() {
      await axios.get(`${usersApiUrl}/pages`).then((response) => {
        setPages(response.data.size);
      });
    }

    async function fetchUsers() {
      await axios.get(`${usersApiUrl}/byPage/1`).then((response) => {
        dispatch(setUsersState([{ page: 1, usersList: response.data }]));
      });
    }
  }, [usersApiUrl, dispatch]);

  const beginTogglingUser = ({ id, userStatus }) => {
    setUserToToggleById(id);
    setUserToToggleStatus(userStatus);
    setTwoButtonModalOpen(true);
  };

  const abortTogglingUser = () => {
    setUserToToggleById(null);
    setTwoButtonModalOpen(false);
  };

  const toggleAccount = async ({ id, page }) => {
    setTwoButtonModalOpen(false);
    await axios
      .put(
        `${usersApiUrl}/toggleAccount/${id}`,
        {},
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        dispatch(toggleUserStatus({ id, page }));
        socket.emit("ban-message", id);
        openModal(response.data.message.msgBody, "Close");
      })
      .catch((err) => {
        console.error(err);
        openModal("Error while toggling user.", "Ok");
      });
  };

  const fetchUsersByPage = async (page) => {
    if (!stateUsers.find((usersPerPage) => usersPerPage.page === page)) {
      await axios.get(`${usersApiUrl}/byPage/${page}`).then((response) => {
        const userFromPage = { page: page, usersList: response.data };
        dispatch(addUsersToState(userFromPage));
      });
    }
    setCurrentPage(page);
  };

  const UserTile = ({ data }) => {
    return (
      <div className={styles.UserTile}>
        <Gravatar className={styles.UserPicture} email={data.email} alt={""} />
        <div className={styles.Username}>{data.username}</div>
        <div className={styles.Role}>{data.role}</div>
        <div className={styles.UserEmail}>{data.email}</div>
        {data.disabled ? (
          <div className={styles.BannedText}>banned</div>
        ) : (
          <div className={styles.UnbannedText}>active</div>
        )}
        {data.role === "admin" ? null : (
          <Button
            buttonFunction={beginTogglingUser}
            buttonFunctionParameters={{
              id: data._id,
              userStatus: data.disabled,
            }}
            buttonText={
              data.disabled ? "Activate user account" : "Disable user account"
            }
          />
        )}
      </div>
    );
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
                buttonFunction={fetchUsersByPage}
                buttonFunctionParameters={1}
                buttonText={1}
              />

              {currentPage - 1 > 1 ? (
                <Button
                  buttonFunction={fetchUsersByPage}
                  buttonFunctionParameters={currentPage - 1}
                  buttonText={currentPage - 1}
                />
              ) : null}
              {currentPage > 1 && currentPage < maxPages ? (
                <Button
                  buttonFunction={fetchUsersByPage}
                  buttonFunctionParameters={currentPage}
                  buttonText={currentPage}
                />
              ) : null}
              {currentPage + 1 < maxPages ? (
                <Button
                  buttonFunction={fetchUsersByPage}
                  buttonFunctionParameters={currentPage + 1}
                  buttonText={currentPage + 1}
                />
              ) : null}

              <Button
                buttonFunction={fetchUsersByPage}
                buttonFunctionParameters={maxPages}
                buttonText={maxPages}
              />
            </div>
          ) : (
            <div className={styles.PageButtonsRender}>
              <Button
                buttonFunction={fetchUsersByPage}
                buttonFunctionParameters={1}
                buttonText={1}
              />
              {maxPages - 2 === 0 ? (
                <Button
                  buttonFunction={fetchUsersByPage}
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
          onClick={() => fetchUsersByPage(pageToFetch)}
        >
          Change page
        </button>
      </div>
    );
  };

  if (!stateUsers.find((users) => users.page === currentPage)) {
    return (
      <main className={styles.MainContainerLoading}>
        <div className={styles.Dot} />
        <div className={styles.Dot} />
        <div className={styles.Dot} />
      </main>
    );
  }

  return (
    <main className={styles.MainContainer}>
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

      <PageButtonsWrapper maxPages={pages} />

      <div className={styles.TileWrapper}>
        {stateUsers
          .find((users) => users.page === currentPage)
          .usersList.map((data, index) => {
            return <UserTile key={index} data={data} />;
          })}
      </div>
      <PageJumper maxPages={pages} />
    </main>
  );
}
