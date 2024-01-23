import styles from "@/styles/components/buttons/Button.module.scss";

const Button = ({ buttonFunction, buttonFunctionParameters, buttonText, disabled }) => {
    return (
      <button onClick={() => buttonFunction(buttonFunctionParameters)} className={styles.Button} disabled={disabled}>
          {buttonText}
      </button>
    );
  }

  export default Button;