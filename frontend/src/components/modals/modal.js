import styles from "@/styles/components/modals/Modal.module.scss";
import Button from "@/components/buttons/button";

const Modal = ({
  modalText,
  buttonFunction,
  buttonText,
  buttonFunctionParameters,
}) => {
  return (
    <div className={styles.Modal}>
      <div
        className={styles.ModalBackground}
        onClick={() => buttonFunction(buttonFunctionParameters)}
      ></div>
      <div className={styles.ModalContent}>
        <p className={styles.ModalText}>{modalText}</p>
        <Button
          buttonFunction={buttonFunction}
          buttonFunctionParameters={buttonFunctionParameters}
          buttonText={buttonText}
        />
      </div>
    </div>
  );
};

export default Modal;
