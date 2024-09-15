// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  tsconfig: "./tsconfig.json",
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true, // 타입 선언 파일 생성
  sourcemap: true,
  clean: true, // 빌드 전 출력 디렉토리 정리
});
