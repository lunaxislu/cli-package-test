import path from "path";
import fs, { pathExists } from "fs-extra";
import fg from "fast-glob";
import { getPackageManager } from "./get-package-info";
import { Framework, FRAMEWORKS } from "./framwork";
import { JsonValue } from "type-fest";
import {
  Node,
  ObjectLiteralExpression,
  Project,
  QuoteKind,
  SourceFile,
  SyntaxKind,
} from "ts-morph";

const PROJECT_SHARED_IGNORE = [
  "**/node_modules/**",
  ".next",
  "public",
  "dist",
  "build",
];
export type ProjectType = {
  framework: Framework;
  isUsingAppDir: boolean;
  isSrcDir: boolean;
  isTsx: boolean;
  configFiles: string[];
  packageManager: JsonValue;
};
export async function getProjectInfo(cwd: string) {
  const [isSrcDir, isTsx, configFiles, packageManager] = await Promise.all([
    fs.pathExists(path.resolve(cwd, "src")),
    isTypeScriptProject(cwd),
    fg.glob("next.config.*", {
      cwd,
      deep: 1,
    }),
    getPackageManager(cwd),
  ]);

  const isNext = configFiles.length > 0; // fg로 pattern 찾으면 [] 안에 들어오기에

  const projectType: ProjectType = {
    framework: FRAMEWORKS["react.js"],
    isUsingAppDir: false,
    isSrcDir,
    isTsx,
    configFiles,
    packageManager,
  };

  if (isNext) {
    projectType.isUsingAppDir = await fs.pathExists(
      path.resolve(cwd, `${isSrcDir ? "src/" : ""}app`),
    );
    projectType.framework = projectType.isUsingAppDir
      ? FRAMEWORKS["next-app"]
      : FRAMEWORKS["next-pages"];
  }
  const tailwindConfigFile = await getTailwindConfigFile(cwd);
  const resolveConfig = {
    ...projectType,
    ...projectType.framework,
    tailwindConfigFile,
  };

  return resolveConfig;
}

export async function getFiles(cwd: string) {
  const files = await fg.glob("**/*", {
    cwd,
    deep: 2,
    ignore: PROJECT_SHARED_IGNORE,
  });
  /**
   * 
   * deep :3 일 때
   * [
  'package.json',
  'pnpm-lock.yaml',
  'tsconfig.json',
  'tsup.config.ts',
  'src/index.ts',
  'src/command/init.ts',
  'src/util/get-project-info.ts',
  'src/util/resolve-path.ts'
]

  deep: 1일 때 
  [ 'package.json', 'pnpm-lock.yaml', 'tsconfig.json', 'tsup.config.ts' ] 

  deep: 2일 때
   [
  'package.json',
  'pnpm-lock.yaml',
  'tsconfig.json',
  'tsup.config.ts',
  'src/index.ts'
]

 */
  return files;
}

//typescript 프로젝트인지
export async function isTypeScriptProject(cwd: string) {
  // Check if cwd has a tsconfig.json file.
  return pathExists(path.resolve(cwd, "tsconfig.json"));
}

// tsconfig 가져오기
export async function getTsConfig() {
  try {
    const tsconfigPath = path.join("tsconfig.json");
    const tsconfig = await fs.readJSON(tsconfigPath);

    if (!tsconfig) {
      throw new Error("tsconfig.json is missing");
    }
    0;
    return tsconfig;
  } catch (error) {
    return null;
  }
}

// tailwindconfig 파일 이름 가져오기
export async function getTailwindConfigFile(cwd: string) {
  const files = await fg.glob("tailwind.config.*", {
    cwd,
    deep: 3,
    ignore: PROJECT_SHARED_IGNORE,
  });
  if (!files.length) {
    return null;
  }
  // 파일 경로 생성
  const filePath = path.join(cwd, files[0]);
  return filePath;
}

export async function getTailwindCssFile(cwd: string) {
  const files = await fg.glob("**/*.css", {
    cwd,
    deep: 5,
    ignore: PROJECT_SHARED_IGNORE,
  });

  if (!files.length) {
    return null;
  }
  /**
   * @explain
   * index.css , global.css, app.css 에 @tailwindBase붙여도 무관
   * tailwind.config.* content 설정 해줘야지 굴러감
   */
  for (const file of files) {
    const contents = await fs.readFile(path.resolve(cwd, file), "utf8");
    if (contents.includes("@tailwind base")) {
      return file;
    }
  }

  return null;
}

export async function updateWithFsToTailwindConfig(filepath: string) {
  try {
    let content = await fs.readFile(filepath, "utf-8");
    // content 배열 부분을 찾고 수정할 내용 추가
    const newContent =
      `"./pages/**/*.{js,ts,jsx,tsx,mdx}",\n` +
      `"./components/**/*.{js,ts,jsx,tsx,mdx}",\n` +
      `"./app/**/*.{js,ts,jsx,tsx,mdx}"`;

    // content: [] 부분을 찾아서 새로운 경로를 추가
    content = content.replace("content: [],", `content: [\n${newContent}\n],`);

    // 수정된 내용을 다시 파일에 저장
    await fs.writeFile(filepath, content, "utf8");
    console.log("Tailwind config updated successfully!");
  } catch (err) {
    console.log(err);
  }
}

export async function updateWithTsmorphToTailwindConfig(filepath: string) {
  try {
    const project = new Project();

    const sourceFile = project.addSourceFileAtPath(filepath);
    // text
    // console.log("File TEXT:\n", sourceFile.getFullText())
    // 파일의 전체 내용을 객체화(구문 트리 생성)
    // console.log("File Contents as AST:\n", sourceFile.getStructure());
    const configObject = sourceFile
      .getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression)
      .find((node) =>
        node
          .getProperties()
          .some(
            (property) =>
              property.isKind(SyntaxKind.PropertyAssignment) &&
              property.getName() === "content",
          ),
      );
    /**
       * @explain cjs, mjs 신경안써두됨
       * // 파일에서 모든 ObjectLiteralExpression(객체 리터럴)을 찾기
    const objectLiterals = sourceFile.getDescendantsOfKind(
      SyntaxKind.ObjectLiteralExpression,
    );

    objectLiterals.forEach((obj) => {
      console.log("Found object literal:", obj);
    });
       */
  } catch (err) {}
}

// 따옴표 종류를 확인하는 유틸리티 함수
function _getQuoteChar(configObject: ObjectLiteralExpression) {
  return configObject
    .getFirstDescendantByKind(SyntaxKind.StringLiteral)
    ?.getQuoteKind() === QuoteKind.Single
    ? "'"
    : '"';
}
