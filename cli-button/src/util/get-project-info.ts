import { detect } from "@antfu/ni";
import fg from "fast-glob";
const PROJECT_SHARED_IGNORE = [
  "**/node_modules/**",
  ".next",
  "public",
  "dist",
  "build",
];

export async function getProjectPackageManager(
  targetDir: string
): Promise<"yarn" | "pnpm" | "bun" | "npm"> {
  const packageManager = await detect({ programmatic: true, cwd: targetDir });
  console.log(packageManager);
  if (packageManager === "yarn@berry") return "yarn";
  if (packageManager === "pnpm@6") return "pnpm";
  if (packageManager === "bun") return "bun";

  return packageManager ?? "npm";
}

export async function isTypescriptProject(cwd: string) {
  const files = await fg.glob("tsconfig.*", {
    cwd,
    deep: 1,
    ignore: PROJECT_SHARED_IGNORE,
  });

  return files.length > 0;
}
