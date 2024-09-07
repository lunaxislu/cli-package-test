import fsExtra from "fs-extra/esm";
import path from "path";
import { defineConfig } from "tsup";

export default defineConfig({
  clean: true, // 빌드 전에 기존 dist 폴더 정리
  dts: true, // 타입 선언 파일 생성
  entry: ["src/index.ts"], // 엔트리 파일
  format: ["esm"], // CommonJS와 ESModules 형식으로 출력
  external: ["react", "react-dom", "@types/css-modules"], // 번들에서 제외할 패키지
  minify: true,
  tsconfig: "./tsconfig.json",
  sourcemap: true, // 소스 맵 생성
  outDir: "dist", // 출력 폴더
  target: "esnext",
  outExtension: ({ format }) => ({ js: format === "esm" ? ".mjs" : ".cjs" }), // ESM 형식일 때 .mjs 확장자 사용

  // 빌드가 성공한 후 파일을 복사하는 명령어 추가
  onSuccess: async () => {
    const srcPath = path.resolve("src/component.json");
    const destPath = path.resolve("dist/component.json");

    // fs-extra를 사용하여 파일 복사
    await fsExtra.copy(srcPath, destPath);
    console.log("component.json 파일이 dist 폴더로 복사되었습니다.");
  },
});

/**
 * external에 추가할 수 있는 패키지 목록:
commander: CLI 명령어를 처리하는 라이브러리이므로, 런타임에서 필요하지만 번들에 포함할 필요는 없습니다.
execa: 외부 명령어 실행을 위해 사용되지만, 번들에 포함하지 않아도 됩니다.
fs-extra: 파일 시스템 작업을 위해 사용되지만, 기본 Node.js의 파일 시스템 API이기 때문에 번들에서 제외해도 괜찮습니다.
kleur: 콘솔에서 컬러 출력을 처리하지만 외부에서 로드할 수 있습니다.
 */
