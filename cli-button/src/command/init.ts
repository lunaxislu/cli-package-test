import path from "path";
import {
  getProjectPackageManager,
  isTypescriptProject,
} from "../util/get-project-info";
import kleur from "kleur";
import fs from "fs-extra";
import { readPackageJson, validateFramework } from "../util/get-package-info";
import { execa } from "execa";
import { ComponentJson } from "../util/path-resolve";
import { getFileContentFromGithub } from "../util/get-module";

export async function init(component: string, filePathResolve: ComponentJson) {
  console.log(kleur.cyan("Installing...."));
  const cwd = process.cwd();
  const srcPath = path.resolve(cwd, "src");
  const componentsPath = path.resolve(srcPath, "components");
  const uiPath = path.resolve(componentsPath, "ui");
  try {
    const [packageManager, packageJson, isTsx] = await Promise.all([
      getProjectPackageManager(cwd),
      readPackageJson(cwd),
      isTypescriptProject(cwd),
    ]);
    const dependency = packageJson.dependencies || {};
    const devDependency = packageJson.devDependencies || {};

    const isValidtedFrameWork = validateFramework();
    // React, Next 검사
    if (!isValidtedFrameWork) {
      throw new Error(
        kleur.red(
          "This project is not a React or Next.js project.\nPlease use this CLI in a React or Next.js project."
        )
      );
    }
    const fileExtension = isTsx ? "tsx" : "jsx";
    const pathResolveKey = isTsx
      ? "typescript"
      : ("javascript" as keyof ComponentJson);

    console.log(
      kleur.blue(
        `Project type: ${
          isTsx ? "TypeScript" : "JavaScript"
        }. Using .${fileExtension} files.`
      )
    );
    // src 폴더가 있는지 확인, 없으면 생성
    await fs.mkdir(uiPath, { recursive: true });

    // 파일 복사
    const files = filePathResolve[pathResolveKey].files;
    for (const file of files) {
      const fileContent = await getFileContentFromGithub(file.path); // GitHub에서 파일 내용 가져오기
      const destPath = path.join(uiPath, file.name); // 복사할 경로 설정
      await fs.writeFile(destPath, fileContent); // 파일 내용을 로컬에 작성
      console.log(kleur.green(`Copied ${file.name} to ${destPath}`));
    }

    // ts일때, css-module 타입 지원 검사
    if (isTsx && !devDependency["@types/css-modules"]) {
      console.log(
        kleur.yellow("@types/css-modules is not installed. Installing...")
      );
      try {
        await execa(
          packageManager,
          [
            packageManager === "npm" ? "install" : "add",
            "@types/css-modules",
            "--save-dev",
          ],
          {
            cwd,
            /**@explain stdio: 'inherit' 설정의 주요 효과:
부모 프로세스(현재 스크립트)와 자식 프로세스(npm install 명령어)의 입출력이 연결됩니다.
npm install의 실행 결과(메시지, 오류)가 콘솔에 그대로 출력됩니다.
예를 들어, npm install 명령어가 터미널에서 실행될 때 보이는 메시지들이 현재 스크립트가 실행 중인 터미널에 그대로 표시됩니다.
입력도 부모 프로세스와 공유되므로, 자식 프로세스에서도 동일한 입력을 받을 수 있습니다.
예시 상황:
stdio: 'inherit'가 설정된 상태에서 npm install을 실행하면, 설치 과정에서 출력되는 정보(진행 상황, 오류 메시지 등)가 현재 실행 중인 터미널에 실시간으로 표시됩니다.
stdio: 'inherit'를 설정하지 않으면, 이러한 메시지가 터미널에 표시되지 않고 자식 프로세스 내에서만 처리됩니다. */
            stdio: "inherit",
          }
        );
        console.log(
          kleur.green("@types/css-modules has been installed successfully.")
        );
      } catch (err) {
        console.log(
          kleur.red(
            "Failed to `${projectPackageManager===npm ? install :add} @types/cs-mdoules"
          ),
          err
        );
      }
    }

    console.log(kleur.green(`Created folders: ${uiPath}`));
  } catch (err) {
    console.error(
      kleur.red("Failed to copy components or install @types/node:"),
      err
    );
  }
}
