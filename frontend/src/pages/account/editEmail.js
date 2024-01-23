import styles from "@/styles/Form.module.scss";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import Router from 'next/router';
import { useSelector } from "react-redux";
import { selectId } from "slices/authSlice";
import Modal from "@/components/modals/modal";
const apiUrl = process.env.SERVER_URL || "http://localhost:5000";

export default function Register() {
  const userId = useSelector(selectId)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCloseSuccessfulFlag, setModalCloseSuccessfulFlag] = useState(false);
  const [modalMessage, setModalMessage] = useState("Email has been updated.");
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
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, "Passwords are at least 8 characters long")
      .required("You need to provide your password"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Not a proper email"),
  });

  const handleSubmit = async (values) => {
    await axios
      .put(`${apiUrl}/users/updateEmail/${userId}`, values, {
        withCredentials: true,
      })
      .then((_response) => {
        setModalCloseSuccessfulFlag(true)
        openModal("Email has been updated.", "Back to my account")
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
            <h1>Update email</h1>

            <div className={styles.inputBox}>
              <Field type="text" id="email" name="email" required />
              <span htmlFor="email">New Email</span>
              <ErrorMessage name="email">
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
                id="password"
                name="password"
                required
              />
              <span htmlFor="password">Confirm by entering your password</span>
              <ErrorMessage name="password">
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
              Update Email
            </button>
            <div className={styles.RedirectColumn}>
              Don&#39;t want to change your email?<Link href="/account/user">Back to my profile</Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
