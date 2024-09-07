import fs from "fs-extra";
import path from "path";
import { Jsonify } from "type-fest";
import { fileURLToPath } from "url";
// 구체적인 타입 정의
interface ComponentFile {
  name: string;
  path: string;
}

interface ComponentVersion {
  files: ComponentFile[];
}

export interface ComponentJson {
  typescript: ComponentVersion;
  javascript: ComponentVersion;
}

// ESM 환경에서 __dirname 대신 import.meta.url 사용
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getComponentJSonInfo(): Jsonify<ComponentJson> {
  // 현재 파일이 있는 경로에서 component.json 파일 경로 설정
  const componentJsonPath = path.resolve(__dirname, "component.json");
  return fs.readJSONSync(componentJsonPath) as Jsonify<ComponentJson>;
}
