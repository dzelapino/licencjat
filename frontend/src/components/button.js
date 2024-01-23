import React, { useState } from "react";
import styles from "@/styles/games/Hangman.module.scss";

const Button = ({ value, handleClick }) => {
  const [disable, setDisable] = useState(false);
  const [style, setStyle] = useState("grey");
  function handlePressButton() {
    setStyle("transparent");
    setDisable(true);
    handleClick();
  }
  return (
    <button
      className={styles.hangman__letter__tile}
      onClick={() => handlePressButton()}
      disabled={disable}
      style={{
        background: style,
      }}
    >
      {value}
    </button>
  );
};

export default Button;
