#!/usr/bin/env node

import { Command } from "commander";
import { getPackageInfo } from "./util/get-package-info";
import { init } from "./command/init";
import { getComponentJSonInfo } from "./util/path-resolve";

function main() {
  const packageInfo = getPackageInfo(); // package.json 정보가져오기
  const pathResolve = getComponentJSonInfo(); // 컴포넌트 경로 설정

  const program = new Command();

  program
    .name("cli-button")
    .description("add components to your project")
    .version(
      packageInfo.version || "1.0.0",
      "-v, --version",
      "display the version number",
    )
    .command("add <button>")
    .action((button) => init(button, pathResolve));

  program.parse();
}

main();
