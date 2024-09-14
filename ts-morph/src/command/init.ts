import { Command } from "commander";
import {
  getProjectInfo,
  getTailwindConfigFile,
  getTailwindCssFile,
  updateWithFsToTailwindConfig,
  updateWithTsmorphToTailwindConfig,
} from "../util/get-project-info";

export const init = new Command().name("init").action(async () => {
  const cwd = process.cwd();
  //   const files = await getFiles(cwd); //fast-globe lib
  //   const pathResolve = await isTypeScriptProject(cwd); // fs-extra - pathExists method
  //   const tsConfig = await getTsConfig(); // fs-extra - readJSON method
  //   const tailwindPath = await getTailwindConfigFile(cwd);
  //   let resolveTailwindPath;

  //   if (tailwindPath) {
  //     resolveTailwindPath = path.resolve(cwd, tailwindPath);
  //     console.log("🚀 ~ init ~ tailwindFile:", resolveTailwindPath);

  //   const projectInfo = await getProjectInfo(cwd);

  const filePath = await getTailwindConfigFile(cwd);
  if (filePath) {
    const res = await updateWithFsToTailwindConfig(filePath);
    await updateWithTsmorphToTailwindConfig(filePath);
  }
});
