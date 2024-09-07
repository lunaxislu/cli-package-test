#!/usr/bin/env node
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.clear();

const answerCallback = (answer) => {
  switch (answer) {
    case "y":
      console.log("감사합니다!");
      rl.close();
      break;
    case "n":
      console.log("죄송합니다!");
      rl.close();
      break;
    default:
      console.clear();
      console.log("y 또는 n만 입력하세요.");
      rl.question("예제가 재미있습니까? (y/n) ", answerCallback);
      break;
  }
};

rl.question("예제가 재미있습니까? (y/n) ", answerCallback);
