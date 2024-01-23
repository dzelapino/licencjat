import styles from "@/styles/Form.module.scss";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import Router from "next/router";
import { useSelector } from "react-redux";
import { selectId } from "slices/authSlice";
import Modal from "@/components/modals/modal";
const apiUrl = process.env.SERVER_URL || "http://localhost:5000";

export default function Register() {
  const userId = useSelector(selectId)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCloseSuccessfulFlag, setModalCloseSuccessfulFlag] = useState(false);
  const [modalMessage, setModalMessage] = useState("Password has been updated.");
  const [modalButtonText, setModalButtonText] = useState("Back to my account");

  const openModal = (modalMessage, modalButtonText) => {
    setModalMessage(modalMessage)
    setModalButtonText(modalButtonText)
    setModalOpen(true);
  };

  const closeModal = () => {
    modalCloseSuccessfulFlag ? Router.push('/account/user') :
    setModalOpen(false)
  };

  const initialValues = {
    oldPassword: "",
    newPassword: "",
  };

  const validationSchema = Yup.object({
    oldPassword: Yup.string()
      .min(8, "Passwords are at least 8 characters long")
      .required("You need to provide your old password"),
    newPassword: Yup.string()
      .min(8, "New password must be 8 characters or longer")
      .required("Type in your new password")
      .matches(
        /^.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*$/,
       'Password needs one special character',
      ).matches(
        /^.*[0-9].*$/,
       'Password needs one number',
      ).matches(
        /^.*[A-Z].*$/,
       'Password needs one uppercase letter',
      ),
  });

  const handleSubmit = async (values) => {
    await axios
      .put(`${apiUrl}/users/updatePassword/${userId}`, values, {
        withCredentials: true,
      })
      .then((_response) => {
        setModalCloseSuccessfulFlag(true)
        openModal("Password has been updated.", "Back to my account")
      })
      .catch((err) => {
        openModal(err.response.data.message.msgBody, "Close")
      });
  };

  return (
    <div className={styles.MainContainer}>
      {modalOpen ? 
        <Modal modalText={modalMessage} buttonFunction={closeModal} buttonText={modalButtonText}/>
        : null}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className={styles.formContainer}>
            <h1>Change password</h1>

            <div className={styles.inputBox}>
              <Field
                type="password"
                id="oldPassword"
                name="oldPassword"
                required
              />
              <span htmlFor="oldPassword">Old Password</span>
              <ErrorMessage name="oldPassword">
                {(msg) => (
                  <div className={styles.inputError}>
                    <Image
                      src="/Warning.png"
                      alt="warning-icon"
                      width={15}
                      height={15}
                    />
                    {msg}
                  </div>
                )}
              </ErrorMessage>
            </div>

            <div className={styles.inputBox}>
              <Field
                type="password"
                id="newPassword"
                name="newPassword"
                required
              />
              <span htmlFor="newPassword">New Password</span>
              <ErrorMessage name="newPassword">
                {(msg) => (
                  <div className={styles.inputError}>
                    <Image
                      src="/Warning.png"
                      alt="warning-icon"
                      width={15}
                      height={15}
                    />
                    {msg}
                  </div>
                )}
              </ErrorMessage>
            </div>

            <button type="submit" disabled={formik.isSubmitting}>
              Update Password
            </button>
            <div className={styles.RedirectColumn}>
              Don&#39;t want to change your password?
              <Link href="/account/user">Back to my profile</Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
