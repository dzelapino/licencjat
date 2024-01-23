import styles from "@/styles/Form.module.scss";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import Router from 'next/router';
import { useDispatch } from "react-redux";
import { setAuthorizedState, setId, setRoleState } from "slices/authSlice";
import Modal from "@/components/modals/modal";
const apiUrl = process.env.SERVER_URL || "http://localhost:5000"

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const expireTime = new Date(new Date().getTime() + 300 * 60 * 1000);
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCloseSuccessfulFlag, setModalCloseSuccessfulFlag] = useState(false);
  const [modalMessage, setModalMessage] = useState("Login Successful");
  const [modalButtonText, setModalButtonText] = useState("Redirect to home");

  const openModal = (modalMessage, modalButtonText) => {
    setModalMessage(modalMessage)
    setModalButtonText(modalButtonText)
    setModalOpen(true);
  };

  const closeModal = () => {
    modalCloseSuccessfulFlag ? Router.push('/') :
    setModalOpen(false)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios
      .post(
        `${apiUrl}/users/login`,
        { username, password },
        { withCredentials: true }
      )
      .then((response) => {
        sessionStorage.setItem("token", JSON.stringify(response.data.jwt));
        const appToken = JSON.stringify(response.data.jwt);
        Cookies.set("appToken", appToken, {
          expires: expireTime,
          sameSite: "Lax",
          secure: true,
        });
        dispatch(setAuthorizedState(response.data.isAuthenticated))
        dispatch(setRoleState(response.data.user.role))
        dispatch(setId(response.data.user.id))
        setModalCloseSuccessfulFlag(true)
        openModal("Login Successful", "Redirect to home")
      })
      .catch((err) => {
        let errorMessage
        try {
          errorMessage = err.response.data.message.msgBody;
        } catch (_error) {
          errorMessage = "Incorrect login credentials";
        }
          openModal(errorMessage, "Try again")
      });
  };

  return (
    <div className={styles.MainContainer}>
      {modalOpen ? 
        <Modal modalText={modalMessage} buttonFunction={closeModal} buttonText={modalButtonText}/>
        : null}
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <h1>Login</h1>
        <div className={styles.inputBox}>
          <input
            type="text"
            id="username"
            required="required"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
          <span>Username</span>
        </div>
        <div className={styles.inputBox}>
          <input
            type="password"
            id="password"
            required="required"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <span>Password</span>
        </div>
        <button type="submit">Log in</button>
        <div className={styles.Redirect}>
          Don&#39;t have an account?<Link href="/account/register">Register</Link>
        </div>
      </form>
    </div>
  );
}
