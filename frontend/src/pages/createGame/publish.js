import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import styles from "@/styles/PublishGameForm.module.scss";
import Image from "next/image";
import Link from "next/link";
import Switch from "@mui/material/Switch";
import jwt_decode from "jwt-decode";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Router from "next/router";
import Dropzone from "react-dropzone";
import Modal from "@/components/modals/modal";
import { useRouter } from "next/router";
const serverUrl = process.env.SERVER_URL || "http://localhost:5000";

export default function publish() {
  const [userData, setUserData] = useState(undefined);
  const [files, setFiles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("Game created");
  const [modalButtonText, setModalButtonText] = useState("Redirect");

  const router = useRouter();

  const openModal = (modalMessage, modalButtonText) => {
    setModalMessage(modalMessage);
    setModalButtonText(modalButtonText);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    try {
      const token = Cookies.get("appToken");
      const decoded = jwt_decode(token);
      fetchData(decoded.sub.id);
    } catch (error) {
      Cookies.remove("userVerified");
      openModal("You need to log in!", "OK");
      Router.push("/account/login");
    }
    async function fetchData(id) {
      await axios
        .get(`${serverUrl}/users/byid/${id}`)
        .then((response) => {
          setUserData(response.data);
        });
    }
  }, []);

  const handleSubmit = async (values) => {
    if (values.files.length === 0) {
      return openModal("Please upload your game's file(s)", "OK");
    }
    await axios
      .post(`${serverUrl}/games`, {
        ...values,
        author: userData._id,
        status: "test",
      })
      .then((response) => {
        openModal("Game " + values.name + " added!", "GO BACK");
        window.location.replace("");
      })
      .catch((err) => {
        openModal("Cannot add game!", "OK");
      });
  };
  const [fileError, setFileError] = useState("");

  const handleDrop = async (acceptedFiles, setFieldValue) => {
    let result = [];
    await Promise.all(
      acceptedFiles.map((file, i) => {
        file.fileSize = file.size;
        file.modified = file.lastModifiedDate;
        file.fileName = file.name;
        file.fileType = file.type;
        return new Promise((resolve) => {
          var reader = new FileReader();
          reader.onload = function (e) {
            var contents = e.target.result;
            file.content = contents;
            result.push(file);
            resolve();
          };
          reader.readAsText(file);
        });
      })
    );
    if (acceptedFiles.length > 2) {
      setFileError("You can only upload two files.");
    } else {
      setFiles(result);
      setFieldValue("files", result);
      setFileError("");
    }
  };

  return (
    <div className={styles.createGameContainer}>
      {modalOpen ? (
        <Modal
          modalText={modalMessage}
          buttonFunction={modalButtonText === "OK" ? closeModal : router.back()}
          buttonText={modalButtonText}
        />
      ) : null}
      <Formik
        initialValues={{
          name: "",
          files: files,
          elementToCompare: "amount",
          order: "asc",
        }}
        validationSchema={Yup.object({
          name: Yup.string()
            .min(5, "Your game name needs to be between 5 to 30 characters")
            .max(30, "Your game name needs to be between 5 to 30 characters")
            .required("Required"),
          // files: Yup.array()
          //   .test({
          //     message: "The error message if length === 1",
          //     test: (arr) => arr.length !== 2,
          //   })
          //   .required("Required"),
          elementToCompare: Yup.string()
            .min(3, "Element needs to be between 3 to 20 characters")
            .max(20, "Element needs to be between 3 to 20 characters")
            .matches("(^amount$|^amount+\\.+[A-Za-z]+.*)", "Name is not valid")
            .required("Required"),
          order: Yup.string()
            .oneOf(["asc", "desc"], "Order must be asc or desc")
            .required("Required"),
        })}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form className={styles.formContainer}>
            <div className={styles.title}>
              <h1>Publish a game</h1>
              <Link href="/createGame/info">
                <Image
                  src="/Info_icon.svg"
                  alt="bg-img"
                  width={30}
                  height={30}
                  className={styles.info_image}
                ></Image>
              </Link>
            </div>
            <div className={styles.inputBox}>
              <div className={styles.title}>
                <label>NAME OF THE GAME</label>
              </div>
              <div>
                <Field
                  className={styles.myinput}
                  name="name"
                  type="text"
                  placeholder="Game name..."
                />
                <ErrorMessage
                  name="name"
                  render={(msg) => <div className={styles.error}>{msg}</div>}
                />
              </div>
            </div>
            <Dropzone onDrop={(files) => handleDrop(files, setFieldValue)}>
              {({ getRootProps, getInputProps }) => (
                <div className={styles.dropzone}>
                  <div
                    {...getRootProps()}
                    className={styles.dropzone__container}
                  >
                    <input {...getInputProps()} name="files" />
                    {files.length > 0 ? (
                      <div className={styles.dropzone__items}>
                        {files.map((file, i) => (
                          <div key={file.name}>
                            {files.at(-1).name === file.name
                              ? `${file.name}`
                              : `${file.name},`}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>
                        Drag and drop a file here, or click to select a file
                      </p>
                    )}
                  </div>
                  <ErrorMessage
                    name="file"
                    component="div"
                    className={styles.dropzone__error}
                  />
                  <div className={styles.dropzone__error}>{fileError}</div>
                </div>
              )}
            </Dropzone>
            <div className={styles.inputBox}>
              <div className={styles.title}>
                <label>ELEMENT TO COMPARE</label>
                <Image
                  src="/Info_icon.svg"
                  alt="bg-img"
                  width={18}
                  height={18}
                  className={styles.info_image}
                ></Image>
                <span className={styles.tooltiptext}>
                  If result is a string or a number and you want to compare by
                  that type 'amount'. If score is an object and u want to
                  compare for example value time of those scores type
                  'amount.time'.
                </span>
              </div>
              <div>
                <Field
                  className={styles.myinput}
                  name="elementToCompare"
                  type="text"
                />
                <ErrorMessage
                  name="elementToCompare"
                  render={(msg) => <div className={styles.error}>{msg}</div>}
                />
              </div>
            </div>
            <div className={styles.inputBox}>
              <div className={styles.title}>
                <label>ORDER OF SCORES</label>
                <Image
                  src="/Info_icon.svg"
                  alt="bg-img"
                  width={18}
                  height={18}
                  className={styles.info_image}
                ></Image>
                <span className={styles.tooltiptext}>
                  In what order would you like scores to be shown?
                </span>
              </div>
              <div className={styles.switchinput}>
                <div>Descending</div>
                <Switch
                  name="order"
                  value="asc"
                  checked={values.order === "asc"}
                  onChange={(event, checked) => {
                    setFieldValue("order", checked ? "asc" : "desc");
                  }}
                  color="default"
                />
                <div>Ascending</div>
              </div>
            </div>
            <button type="submit">Submit</button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
