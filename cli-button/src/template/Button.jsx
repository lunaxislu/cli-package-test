import React from "react";
import styles from "./Button.module.css";

const Button = ({ variant = "primary", children, ...props }) => {
  return (
    <button
      className={`${styles.btn} ${
        variant === "primary" ? styles.primary : styles.secondary
      }`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
