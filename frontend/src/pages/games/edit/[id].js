import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import styles from "@/styles/PublishGameForm.module.scss";
import Image from "next/image";
import Link from "next/link";
import Switch from "@mui/material/Switch";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { useRouter } from "next/router";
import { selectRoleState, setRoleState } from "slices/authSlice";
import { useSelector, useDispatch } from "react-redux";
import Modal from "@/components/modals/modal";
const serverUrl = process.env.SERVER_URL || "http://localhost:5000";

export default function test() {
  const [gameData, setGameData] = useState(null);
  const [files, setFiles] = useState([]);
  const router = useRouter();
  const { id } = router.query;
  const role = useSelector(selectRoleState);
  const dispatch = useDispatch();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("Game created");
  const [modalButtonText, setModalButtonText] = useState("Redirect");

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
      if (Cookies.get("userRole") !== undefined) {
        dispatch(setRoleState(Cookies.get("userRole")));
      }
    } catch (error) {
      dispatch(setRoleState("public"));
    }
  });

  useEffect(() => {
    !gameData && id
      ? axios.get(`${serverUrl}/games/${id}`).then((response) => {
          setGameData(response.data);
          setFiles(response.data.files);
        })
      : null;
    if (gameData) {
      // console.log(gameData);
    }
  });

  function compareArrays(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false;
    }
    const namesMap = new Map();
    for (const obj of arr2) {
      namesMap.set(obj.content, true);
    }
    for (const obj of arr1) {
      if (!namesMap.has(obj.content)) {
        return false;
      }
    }
    return true;
  }

  const handleSubmit = async (values) => {
    if (values.files.length === 0) {
      return openModal("Files are missing", "OK");
    }
    if (role !== "admin" && compareArrays(files, values.files)) {
      return openModal("Same files as before", "OK");
    }
    if (
      role === "admin" &&
      values.status === "rejected" &&
      values.testComment !== undefined
    ) {
      return openModal("Please leave a comment", "OK");
    }
    await axios
      .put(`${serverUrl}/games/${id}`, {
        ...values,
      })
      .then((response) => {
        openModal("Game " + values.name + " " + values.status, "OK");
        if (values.status === "active") {
          router.push(`/games/${values.name}`);
        }
      })
      .catch((err) => {
        openModal(`Cannot add game, ${err.response.data}`, "OK");
      });
  };

  const handleDownloadClick = () => {
    gameData.files &&
      gameData.files.forEach((file) => {
        const { path, content } = file;
        const extension = path.split(".").pop();
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = path;
        link.click();
      });
  };

  const [fileError, setFileError] = useState("");
  const handleDrop = async (acceptedFiles, setFieldValue) => {
    let result = [];
    await Promise.all(
      acceptedFiles.map((file, i) => {
        console.log(file);
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
    console.log(result);
    if (acceptedFiles.length > 2) {
      setFileError("You can only upload two files.");
    } else {
      gameData.files = result;
      setFieldValue("files", result);
      setFileError("");
    }
  };

  return (
    <div className={styles.createGameContainer}>
      {modalOpen ? (
        <Modal
          modalText={modalMessage}
          buttonFunction={closeModal}
          buttonText={modalButtonText}
        />
      ) : null}
      {gameData && (
        <Formik
          initialValues={{
            name: gameData.name,
            files: gameData.files,
            elementToCompare: gameData.elementToCompare,
            order: gameData.order,
            testComment: gameData.testComment,
            status: "test",
          }}
          validationSchema={Yup.object({
            name: Yup.string()
              .min(5, "Your game name needs to be between 5 to 30 characters")
              .max(30, "Your game name needs to be between 5 to 30 characters")
              .required("Required"),
            files: Yup.array().required("Required"),
            elementToCompare: Yup.string()
              .min(6, "Element needs to be between 6 to 10000 characters")
              .max(10000, "Element needs to be between 6 to 10000 characters")
              .matches(
                "(^amount$|^amount+\\.+[A-Za-z]+.*)",
                "Name is not valid"
              )
              .required("Required"),
            order: Yup.string()
              .oneOf(["asc", "desc"], "Order must be asc or desc")
              .required("Required"),
            testComment: Yup.string("The test comment must be a string"),
          })}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form className={styles.formContainer}>
              <div className={styles.title}>
                <h1>Test the "{gameData.name}" game</h1>
                <Link href="/creategame/info">
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
                    disabled
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
                      <input
                        {...getInputProps()}
                        name="files"
                        // onChange={(e) => console.log(e)}
                      />
                      {gameData.files ? (
                        <div className={styles.dropzone__items}>
                          {gameData.files.map((file, i) => (
                            <div key={file.path}>
                              {gameData.files.at(-1).path === file.path
                                ? `${file.path}`
                                : `${file.path},`}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <ErrorMessage
                      name="file"
                      component="div"
                      className={styles.dropzone__error}
                    />
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
                  {role === "admin" ? (
                    <Field
                      className={styles.myinput}
                      name="elementToCompare"
                      type="text"
                      disabled
                    />
                  ) : (
                    <Field
                      className={styles.myinput}
                      name="elementToCompare"
                      type="text"
                    />
                  )}
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
                  {role === "admin" ? (
                    <Switch
                      name="order"
                      checked={values.order === "asc"}
                      onChange={(event, checked) => {
                        setFieldValue("order", checked ? "asc" : "desc");
                      }}
                      color="default"
                      disabled
                    />
                  ) : (
                    <Switch
                      name="order"
                      checked={values.order === "asc"}
                      onChange={(event, checked) => {
                        setFieldValue("order", checked ? "asc" : "desc");
                      }}
                      color="default"
                    />
                  )}
                  <div>Ascending</div>
                </div>
              </div>
              <div className={styles.inputBox}>
                <div className={styles.title}>
                  {role === "admin" ? (
                    <label>LEAVE A COMMENT</label>
                  ) : (
                    <label>RECEIVED COMMENT</label>
                  )}
                </div>
                <div>
                  {role === "admin" ? (
                    <Field
                      className={styles.myinput}
                      name="testComment"
                      type="textarea"
                    />
                  ) : (
                    <div className={styles.myinput}>{gameData.testComment}</div>
                  )}
                  <ErrorMessage
                    name="testComment"
                    render={(msg) => <div className={styles.error}>{msg}</div>}
                  />
                </div>
              </div>
              {role === "admin" ? (
                <div className={styles.button__container}>
                  <button
                    type="button"
                    className={styles.button__container__buttonEdit}
                    onClick={handleDownloadClick}
                  >
                    DOWNLOAD FILES
                  </button>
                  {gameData.status !== "active" && (
                    <button
                      type="submit"
                      className={styles.button__container__buttonTest}
                      onClick={() => (values.status = "active")}
                    >
                      ACCEPT
                    </button>
                  )}
                  {gameData.status !== "rejected" && (
                    <button
                      type="submit"
                      className={styles.button__container__buttonDelete}
                      onClick={() => (values.status = "rejected")}
                    >
                      REJECT
                    </button>
                  )}
                </div>
              ) : (
                <div className={styles.button__container}>
                  <button
                    type="button"
                    className={styles.button__container__buttonEdit}
                    onClick={() => router.back()}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className={styles.button__container__buttonTest}
                    onClick={() => (values.status = "active")}
                  >
                    CONFIRM
                  </button>
                </div>
              )}
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
}
