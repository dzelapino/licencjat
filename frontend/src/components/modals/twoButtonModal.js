import styles from "@/styles/components/modals/Modal.module.scss";
import Button from "@/components/buttons/button";

const TwoButtonModal = ({
  modalText,
  mainButtonLeft,
  leftButtonFunction,
  leftButtonText,
  leftButtonFunctionParameters,
  rightButtonFunction,
  rightButtonText,
  rightButtonFunctionParameters,
}) => {
  return (
    <div className={styles.Modal}>
      <div
        className={styles.ModalBackground}
        onClick={() =>
          mainButtonLeft
            ? leftButtonFunction(leftButtonFunctionParameters)
            : rightButtonFunction(rightButtonFunctionParameters)
        }
      ></div>
      <div className={styles.ModalContent}>
        <p className={styles.ModalText}>{modalText}</p>
        <div className={styles.ModalButtons}>
          <Button
            buttonFunction={leftButtonFunction}
            buttonFunctionParameters={leftButtonFunctionParameters}
            buttonText={leftButtonText}
          />
          <Button
            buttonFunction={rightButtonFunction}
            buttonFunctionParameters={rightButtonFunctionParameters}
            buttonText={rightButtonText}
          />
        </div>
      </div>
    </div>
  );
};

export default TwoButtonModal;
