// src/commands/init.ts
import { promises as fs } from "fs";
import path from "path";
import { Command } from "commander";

import { execa } from "execa";

import prompts from "prompts";
import { loading } from "../util/loading";
import { getProjectInfo } from "../util/get-project-info";
import { logger } from "../util/logger";
import { readPackageJson } from "../util/get-package-info";

const REQUIRED_DAYJS_VERSION = "^1.10.4";

export const init = new Command()
  .name("init")
  .description("Initialize your project and setup Calendar component")
  .action(async () => {
    const cwd = process.cwd();
    const spinner = loading("Detecting project info...").start();

    try {
      // 1. 프로젝트 정보를 수집
      const projectInfo = await getProjectInfo(cwd);
      if (!projectInfo) {
        return logger.error(
          "you must install packageManager : npm , pnpm or yarn",
          process.exit(1),
        );
      }

      spinner.succeed("Project info detected:");
      logger.info(JSON.stringify(projectInfo, null, 2));

      // 2. 프로젝트의 package.json 확인
      const projectPackageJson = await readPackageJson(cwd);
      const projectDependencies = projectPackageJson.dependencies || {};
      const packageManager = projectInfo.packageManager;
      const isTsx = projectInfo.isTsx;

      // 3. Day.js 설치 확인 및 업데이트
      const currentDayjsVersion = projectDependencies.dayjs;

      if (!currentDayjsVersion) {
        // Day.js가 없으면 설치
        logger.info("Day.js is not installed. Installing...");
        await execa(
          packageManager,
          [
            packageManager === "npm" ? "install" : "add",
            `dayjs@${REQUIRED_DAYJS_VERSION}`,
          ],
          { cwd, stdio: "inherit" },
        );
        logger.success(`Day.js@${REQUIRED_DAYJS_VERSION} installed.`);
      } else if (currentDayjsVersion < REQUIRED_DAYJS_VERSION) {
        // Day.js가 설치되어 있지만 버전이 낮으면 업데이트
        logger.info(
          `Day.js version is lower than required. Updating to ${REQUIRED_DAYJS_VERSION}...`,
        );
        await execa(
          packageManager,
          [
            packageManager === "npm" ? "install" : "add",
            `dayjs@${REQUIRED_DAYJS_VERSION}`,
          ],
          { cwd, stdio: "inherit" },
        );
        logger.success(`Day.js updated to ${REQUIRED_DAYJS_VERSION}.`);
      } else {
        logger.success("Day.js is up to date.");
      }

      // 4. TypeScript 프로젝트일 경우 CSS 모듈 타입 확인 및 설치
      if (isTsx) {
        const devDependencies = projectPackageJson.devDependencies || {};
        const isCssModulesTypesInstalled =
          devDependencies["@types/css-modules"];

        if (!isCssModulesTypesInstalled) {
          logger.info("Installing @types/css-modules for CSS Modules...");
          await execa(
            packageManager,
            [
              packageManager === "npm" ? "install" : "add",
              "--save-dev",
              "@types/css-modules",
            ],
            { cwd, stdio: "inherit" },
          );
          logger.success("@types/css-modules installed.");
        } else {
          logger.success("@types/css-modules is already installed.");
        }
      }

      // 5. component.json 파일 생성 또는 덮어쓰기 여부 확인
      const componentJsonPath = path.resolve(cwd, "component.json");

      const fileExists = await fs
        .access(componentJsonPath)
        .then(() => true)
        .catch(() => false);

      let overwrite = true; // 기본값은 덮어쓰기 허용

      if (fileExists) {
        const response = await prompts({
          type: "confirm",
          name: "overwrite",
          message:
            "component.json already exists. Do you want to overwrite it?",
          initial: false,
        });

        overwrite = response.overwrite;
      }

      if (!overwrite) {
        logger.info("component.json file was not overwritten.");
        return logger.info("Execution terminated.");
      }

      // 6. component.json 파일 생성
      const componentJson = {
        name: "Calendar",
        version: "1.0.0",
        description: "A customizable calendar component using Day.js",
        packageManager: projectInfo.packageManager,
        isSrcDir: projectInfo.isSrcDir,
        isTsx: projectInfo.isTsx,
        isNext: projectInfo.isNext,
        isUsingAppDir: projectInfo.isUsingAppDir,
        calendar: {
          path: "./src/calendar",
          cssModule: true,
        },
      };

      await fs.writeFile(
        componentJsonPath,
        JSON.stringify(componentJson, null, 2),
        "utf8",
      );
      logger.success(`component.json has been created at ${componentJsonPath}`);
    } catch (error) {
      spinner.fail("Failed to initialize the project");
      logger.error("Failed to initialize the project");
    }
  });
