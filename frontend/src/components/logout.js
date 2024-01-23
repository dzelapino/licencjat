import axios from "axios";
import Cookies from "js-cookie";
import styles from "@/styles/components/Navbar.module.scss";
import Router from "next/router";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setAuthorizedState, setId, setRoleState } from "slices/authSlice";
import TwoButtonModal from "@/components/modals/twoButtonModal";
import Worker from "web-worker";

const serverUrl = process.env.SERVER_URL || "http://localhost:5000";
let worker;

export default function Logout() {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);

  const logout = async () => {
    await axios
      .get(`${serverUrl}/users/logout`, {
        withCredentials: true,
      })
      .then((_response) => {
        Cookies.remove("appToken");
        dispatch(setAuthorizedState(false));
        dispatch(setId(null));
        dispatch(setRoleState("public"));
        Router.push("/");
      })
      .catch((_err) => {
        Cookies.remove("appToken");
        dispatch(setAuthorizedState(false));
        dispatch(setId(null));
        dispatch(setRoleState("public"));
        Router.push("/");
      });
  };

  const startLoggingOut = () => {
    if (worker === undefined) {
      worker = new Worker(new URL("../../public/worker.js", import.meta.url), {
        type: "module",
      });
      worker.addEventListener("message", (e) => {
        if (e.data === "Finished") {
          logout();
        }
      });
    }
    worker.postMessage("Start");
    setModalOpen(true);
  };

  const stopLoggingOut = () => {
    worker.terminate();
    worker = undefined;
    setModalOpen(false);
  };

  const logoutNow = () => {
    worker.terminate();
    worker = undefined;
    logout();
  };

  return (
    <div className={styles.sidebarButtons}>
      {modalOpen ? (
        <TwoButtonModal
          modalText={`You will be logged out in 5 seconds.`}
          mainButtonLeft={true}
          leftButtonText={"Stop logging out"}
          leftButtonFunction={stopLoggingOut}
          rightButtonText={"Logout now"}
          rightButtonFunction={logoutNow}
        />
      ) : null}

      <div className={styles.navLink} onClick={startLoggingOut}>
        Logout
      </div>
    </div>
  );
}
