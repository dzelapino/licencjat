import styles from "@/styles/components/modals/Modal.module.scss";
import Button from "@/components/buttons/button";

const ThreeButtonModal = ({
  modalText,
  mainButtonFunction,
  mainButtonText,
  mainButtonFunctionParameters,
  secondButtonFunction,
  secondButtonText,
  secondButtonFunctionParameters,
  thirdButtonFunction,
  thirdButtonText,
  thirdButtonFunctionParameters,
}) => {
  return (
    <div className={styles.Modal}>
      <div
        className={styles.ModalBackground}
        onClick={() => mainButtonFunction(mainButtonFunctionParameters)}
      ></div>
      <div className={styles.ModalContent}>
        <p className={styles.ModalText}>{modalText}</p>
        <div className={styles.ModalButtons}>
          <Button
            buttonFunction={secondButtonFunction}
            buttonFunctionParameters={secondButtonFunctionParameters}
            buttonText={secondButtonText}
          />
          <Button
            buttonFunction={thirdButtonFunction}
            buttonFunctionParameters={thirdButtonFunctionParameters}
            buttonText={thirdButtonText}
          />
        </div>
        <Button
          buttonFunction={mainButtonFunction}
          buttonFunctionParameters={mainButtonFunctionParameters}
          buttonText={mainButtonText}
        />
      </div>
    </div>
  );
};

export default ThreeButtonModal;
