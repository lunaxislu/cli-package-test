import path from "path";
import fs from "fs-extra";
import { type PackageJson } from "type-fest";
export async function getPackageManager(cwd: string): Promise<PackageJson> {
  const packageJsonPath = path.join(cwd, "package.json");
  return fs.readJSON(packageJsonPath);
}
