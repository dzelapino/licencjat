import styles from "@/styles/Form.module.scss";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import Router from 'next/router';
import Modal from "@/components/modals/modal";
const serverUrl = process.env.SERVER_URL || "http://localhost:5000"

export default function Register() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCloseSuccessfulFlag, setModalCloseSuccessfulFlag] = useState(false);
  const [modalMessage, setModalMessage] = useState("Register Successful");
  const [modalButtonText, setModalButtonText] = useState("Redirect to login");

  const openModal = (modalMessage, modalButtonText) => {
    setModalMessage(modalMessage)
    setModalButtonText(modalButtonText)
    setModalOpen(true);
  };

  const closeModal = () => {
    modalCloseSuccessfulFlag ? Router.push('/account/login') :
    setModalOpen(false)
  };

  const initialValues = {
    username: "",
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string()
      .min(5, "Username must be at least 5 characters long")
      .max(15, "Username can be at most 15 characters long")
      .required("Username required"),
    email: Yup.string()
      .email("Invalid email address")
      .max(50, "Maximum length of email address is 50")
      .required("Email required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters long")
      .required("Password required")
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

  const handleSubmit = async (formData) => {
    await axios
      .post(
        `${serverUrl}/users/register`,
        { ...formData },
        { withCredentials: true }
      )
      .then((_response) => {
        setModalCloseSuccessfulFlag(true)
        openModal("Register Successful", "Redirect to login")
      })
      .catch((err) => {
          let errorMessage
          try {
            errorMessage = err.response.data.message.msgBody;
          } catch (_error) {
            errorMessage = "Register unsuccessful";
          }
        openModal(errorMessage, "Try again")
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
            <h1>Register</h1>

            <div className={styles.inputBox}>
              <Field type="text" id="username" name="username" required />
              <span htmlFor="username">Username</span>
              <ErrorMessage name="username">
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
              <Field type="email" id="email" name="email" required />
              <span htmlFor="email">Email</span>
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
              <Field type="password" id="password" name="password" required />
              <span htmlFor="password">Password</span>
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
              Register
            </button>
            <div className={styles.Redirect}>
              Already have an account?<Link href="/account/login">Login</Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
