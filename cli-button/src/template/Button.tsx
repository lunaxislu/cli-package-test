import React from "react";
import { ButtonHTMLAttributes } from "react";

import styles from "./Button.module.css";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "primary" | "secondary";
}
const Button = ({ variant = "primary", children, ...props }: ButtonProps) => {
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
