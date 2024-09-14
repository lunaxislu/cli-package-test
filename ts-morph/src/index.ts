#!/usr/bin/env node

import { Command } from "commander";
import { init } from "./command/init";

async function main() {
  const program = new Command();
  program.name("ts-morph-test");

  program.addCommand(init);
  program.parse();
}

main();
