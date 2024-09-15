#!/usr/bin/env node
import { cosmiconfig } from "cosmiconfig";
import path from "path";
import {
  AssignmentExpression,
  ObjectLiteralExpression,
  Project,
  PropertyAssignment,
  SyntaxKind,
  StringLiteral,
} from "ts-morph";
import fs from "fs-extra";

// 탐색기를 설정해 ESLint 설정 파일을 찾음
const explorer = cosmiconfig("eslint", {
  searchPlaces: [
    ".eslintrc.json",
    ".eslintrc.cjs",
    "eslint.config.js",
    ".eslint.config.js",
    "eslint.config.mjs",
    ".eslint.config.mjs",
    "eslint.config.cjs",
    ".eslint.config.cjs",
    ".eslintr.mjs",
    ".eslintrc.js",
  ],
});

// 설정 파일 로드 및 처리 함수
async function loadConfig() {
  try {
    const result = await explorer.search();
    if (!result) return null;

    const filepath = result.filepath;
    const fileExtension = path.extname(filepath);
    const config = result.config;

    if (fileExtension === ".json") {
      // JSON 파일일 때 처리
      config.rules = config.rules || {};
      config.rules["react/prop-types"] = "off";
      await fs.writeJSON(filepath, config, { spaces: 2 });
      return;
    }

    const project = new Project();
    if (Array.isArray(config)) {
      const sourceFile = project.addSourceFileAtPath(filepath);
      const arrayExpressions = sourceFile.getDescendantsOfKind(
        SyntaxKind.ArrayLiteralExpression,
      );
      let rulesPropertyFound = false;

      if (arrayExpressions.length > 0) {
        arrayExpressions.forEach((arrayExpression) => {
          const objectLiterals = arrayExpression
            .getElements()
            .filter(
              (element) =>
                element.getKind() === SyntaxKind.ObjectLiteralExpression,
            );

          objectLiterals.forEach((objectLiteralExpression) => {
            const objectLiteral = objectLiteralExpression.asKind(
              SyntaxKind.ObjectLiteralExpression,
            );

            if (objectLiteral) {
              const rulesProperty = objectLiteral.getProperty(
                `rules`,
              ) as PropertyAssignment;

              if (rulesProperty) {
                rulesPropertyFound = true;

                const rulesInitializer = rulesProperty.getInitializer();

                if (rulesInitializer) {
                  const rulesObject = rulesInitializer.asKind(
                    SyntaxKind.ObjectLiteralExpression,
                  ) as ObjectLiteralExpression;
                  const quoteChar = _getQuoteChar(rulesObject);

                  // "react/prop-types" 규칙이 있는지 확인
                  const propTypesRule = rulesObject.getProperty(
                    `${quoteChar}react/prop-types${quoteChar}`,
                  );

                  if (!propTypesRule) {
                    // 규칙이 없으면 추가
                    rulesObject.addPropertyAssignment({
                      name: `${quoteChar}react/prop-types${quoteChar}`,
                      initializer: `${quoteChar}off${quoteChar}`,
                    });
                    console.log('"react/prop-types" 규칙이 추가되었습니다.');
                  } else {
                    console.log('"react/prop-types" 규칙이 이미 존재합니다.');
                  }
                }
              }
            }
          });

          // rules 속성이 없었으면 추가
          if (!rulesPropertyFound) {
            console.log("rulesProperty가 존재하지 않음. 새로 생성합니다.");

            // 첫 번째 객체 리터럴에 rules: {} 추가
            const firstObjectLiteral = arrayExpression
              .getElements()[0]
              .asKind(SyntaxKind.ObjectLiteralExpression);
            if (firstObjectLiteral) {
              const quoteChar = _getQuoteChar(firstObjectLiteral);
              firstObjectLiteral.addPropertyAssignment({
                name: `${quoteChar}rules${quoteChar}`,
                initializer: `{ ${quoteChar}react/prop-types${quoteChar}: ${quoteChar}off${quoteChar} }`,
              });
              console.log('"rules" 속성이 새로 추가되었습니다.');
            }
          }
        });
      }
      await sourceFile.save();
      return;
    }

    const sourceFile = project.addSourceFileAtPath(filepath);
    const objectLiterals = sourceFile.getDescendantsOfKind(
      SyntaxKind.ObjectLiteralExpression,
    );

    let rulesAdded = false; // 규칙 추가 여부 추적

    objectLiterals.forEach((objectLiteral) => {
      if (objectLiteral instanceof ObjectLiteralExpression) {
        const quoteChar = _getQuoteChar(objectLiteral);
        const rulesProperty = objectLiteral.getProperty(
          `rules`,
        ) as PropertyAssignment;

        if (rulesProperty) {
          const rulesInitializer =
            rulesProperty.getInitializer() as ObjectLiteralExpression;

          const quoteChar = _getQuoteChar(rulesInitializer);
          if (rulesInitializer) {
            // "react/prop-types" 속성 확인
            const existingProperty = rulesInitializer.getProperty(
              `${quoteChar}react/prop-types${quoteChar}`,
            ) as PropertyAssignment | undefined;
            console.log();
            if (!existingProperty) {
              rulesInitializer.addPropertyAssignment({
                name: `${quoteChar}react/prop-types${quoteChar}`,
                initializer: `${quoteChar}off${quoteChar}`,
              });
            }
            if (existingProperty) {
              existingProperty.setInitializer(`${quoteChar}off${quoteChar}`);
              console.log(
                '"react/prop-types" 규칙의 값을 "off"로 설정했습니다.',
              );
            }
            rulesAdded = true;
          }
        }
      }
    });

    // 모든 objectLiteral을 순회한 후 rulesBoolean이 false라면 새로운 rules 속성 추가
    if (!rulesAdded) {
      const firstObjectLiteral = objectLiterals[0] as ObjectLiteralExpression;
      const quoteChar = _getQuoteChar(firstObjectLiteral);
      firstObjectLiteral.addPropertyAssignment({
        name: `${quoteChar}rules${quoteChar}`,
        initializer: `{ ${quoteChar}react/prop-types${quoteChar}: ${quoteChar}off${quoteChar} }`,
      });
      console.log('"rules" 속성이 새로 추가되었습니다.');
    }

    // 변경사항 저장
    await sourceFile.save();
  } catch (error) {
    console.error("Error loading config:", error);
  }
}

loadConfig();
export function _getQuoteChar(configObject: ObjectLiteralExpression): string {
  return configObject
    .getFirstDescendantByKind(SyntaxKind.StringLiteral)
    ?.getQuoteKind() === "'"
    ? "'"
    : '"';
}
