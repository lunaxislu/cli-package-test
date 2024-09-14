import path from "path";
import fs, { pathExists } from "fs-extra";
import fg from "fast-glob";
import { getPackageManager } from "./get-package-info";
import { Framework, FRAMEWORKS } from "./framwork";
import { JsonValue } from "type-fest";

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
      path.resolve(cwd, `${isSrcDir ? "src/" : ""}app`)
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

// tailwindconfig 파일 경로 가져오기
export async function getTailwindConfigFile(cwd: string) {
  const files = await fg.glob("tailwind.config.*", {
    cwd,
    deep: 3,
    ignore: PROJECT_SHARED_IGNORE,
  });

  if (!files.length) {
    return null;
  }

  return files[0];
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

  for (const file of files) {
    const contents = await fs.readFile(path.resolve(cwd, file), "utf8");
    if (contents.includes("@tailwind base")) {
      return file;
    }
  }

  return null;
}
