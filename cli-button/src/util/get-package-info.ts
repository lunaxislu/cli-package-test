import path from "path";
import fs from "fs-extra";
import { type PackageJson } from "type-fest";

export function getPackageInfo(): PackageJson {
  const packageJsonPath = path.join("package.json");

  return fs.readJSONSync(packageJsonPath);
}

export async function readPackageJson(cwd: string): Promise<PackageJson> {
  const packageJsonPath = path.join(cwd, "package.json");
  return fs.readJSON(packageJsonPath);
}

export function validateFramework(): boolean {
  const packageJson = getPackageInfo();
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};

  const allDependencies = { ...dependencies, ...devDependencies };

  const isReact = !!allDependencies["react"];
  const isNext = !!allDependencies["next"];
  let validation = true;

  if (!isReact && !isNext) validation = false;

  return validation;
}
