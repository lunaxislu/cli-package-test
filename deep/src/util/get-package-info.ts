import path from "path";
import fs from "fs-extra";
import { type PackageJson } from "type-fest";

export function getPackageInfo(): PackageJson {
  const packageJsonPath = path.join("package.json");

  return fs.readJSONSync(packageJsonPath);
}

/**
 * 
 * 
 * 
 * const packageInfo = getPackageInfo();
  console.log(packageInfo);
 * 
{
  name: 'ts',
  version: '1.0.0',
  description: '',
  main: 'index.js',
  scripts: { test: 'node dist/index.js', build: 'tsc' },
  keywords: [],
  author: '',
  license: 'ISC',
  devDependencies: {
    '@types/fs-extra': '^11.0.4',
    '@types/node': '^22.5.4',
    typescript: '^5.5.4'
  },
  dependencies: {
    '@antfu/ni': '^0.23.0',
    'fs-extra': '^11.2.0',
    'type-fest': '^4.26.0'
  }
}
 */
export async function readPackageJson(cwd: string): Promise<PackageJson> {
  const packageJsonPath = path.join(cwd, "package.json");
  return fs.readJSON(packageJsonPath);
}
