#!/usr/bin/env node

// src/index.ts
import { cosmiconfig } from "cosmiconfig";
import path from "path";
import {
  ObjectLiteralExpression,
  Project,
  SyntaxKind
} from "ts-morph";
import fs from "fs-extra";
var explorer = cosmiconfig("eslint", {
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
    ".eslintrc.js"
  ]
});
async function loadConfig() {
  try {
    const result = await explorer.search();
    if (!result) return null;
    const filepath = result.filepath;
    const fileExtension = path.extname(filepath);
    const config = result.config;
    if (fileExtension === ".json") {
      config.rules = config.rules || {};
      config.rules["react/prop-types"] = "off";
      await fs.writeJSON(filepath, config, { spaces: 2 });
      return;
    }
    const project = new Project();
    if (Array.isArray(config)) {
      const sourceFile2 = project.addSourceFileAtPath(filepath);
      const arrayExpressions = sourceFile2.getDescendantsOfKind(
        SyntaxKind.ArrayLiteralExpression
      );
      let rulesPropertyFound = false;
      if (arrayExpressions.length > 0) {
        arrayExpressions.forEach((arrayExpression) => {
          const objectLiterals2 = arrayExpression.getElements().filter(
            (element) => element.getKind() === SyntaxKind.ObjectLiteralExpression
          );
          objectLiterals2.forEach((objectLiteralExpression) => {
            const objectLiteral = objectLiteralExpression.asKind(
              SyntaxKind.ObjectLiteralExpression
            );
            if (objectLiteral) {
              const rulesProperty = objectLiteral.getProperty(
                `rules`
              );
              if (rulesProperty) {
                rulesPropertyFound = true;
                const rulesInitializer = rulesProperty.getInitializer();
                if (rulesInitializer) {
                  const rulesObject = rulesInitializer.asKind(
                    SyntaxKind.ObjectLiteralExpression
                  );
                  const quoteChar = _getQuoteChar(rulesObject);
                  const propTypesRule = rulesObject.getProperty(
                    `${quoteChar}react/prop-types${quoteChar}`
                  );
                  if (!propTypesRule) {
                    rulesObject.addPropertyAssignment({
                      name: `${quoteChar}react/prop-types${quoteChar}`,
                      initializer: `${quoteChar}off${quoteChar}`
                    });
                    console.log('"react/prop-types" \uADDC\uCE59\uC774 \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4.');
                  } else {
                    console.log('"react/prop-types" \uADDC\uCE59\uC774 \uC774\uBBF8 \uC874\uC7AC\uD569\uB2C8\uB2E4.');
                  }
                }
              }
            }
          });
          if (!rulesPropertyFound) {
            console.log("rulesProperty\uAC00 \uC874\uC7AC\uD558\uC9C0 \uC54A\uC74C. \uC0C8\uB85C \uC0DD\uC131\uD569\uB2C8\uB2E4.");
            const firstObjectLiteral = arrayExpression.getElements()[0].asKind(SyntaxKind.ObjectLiteralExpression);
            if (firstObjectLiteral) {
              const quoteChar = _getQuoteChar(firstObjectLiteral);
              firstObjectLiteral.addPropertyAssignment({
                name: `${quoteChar}rules${quoteChar}`,
                initializer: `{ ${quoteChar}react/prop-types${quoteChar}: ${quoteChar}off${quoteChar} }`
              });
              console.log('"rules" \uC18D\uC131\uC774 \uC0C8\uB85C \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4.');
            }
          }
        });
      }
      await sourceFile2.save();
      return;
    }
    const sourceFile = project.addSourceFileAtPath(filepath);
    const objectLiterals = sourceFile.getDescendantsOfKind(
      SyntaxKind.ObjectLiteralExpression
    );
    let rulesAdded = false;
    objectLiterals.forEach((objectLiteral) => {
      if (objectLiteral instanceof ObjectLiteralExpression) {
        const quoteChar = _getQuoteChar(objectLiteral);
        const rulesProperty = objectLiteral.getProperty(
          `rules`
        );
        if (rulesProperty) {
          const rulesInitializer = rulesProperty.getInitializer();
          const quoteChar2 = _getQuoteChar(rulesInitializer);
          if (rulesInitializer) {
            const existingProperty = rulesInitializer.getProperty(
              `${quoteChar2}react/prop-types${quoteChar2}`
            );
            console.log();
            if (!existingProperty) {
              rulesInitializer.addPropertyAssignment({
                name: `${quoteChar2}react/prop-types${quoteChar2}`,
                initializer: `${quoteChar2}off${quoteChar2}`
              });
            }
            if (existingProperty) {
              existingProperty.setInitializer(`${quoteChar2}off${quoteChar2}`);
              console.log(
                '"react/prop-types" \uADDC\uCE59\uC758 \uAC12\uC744 "off"\uB85C \uC124\uC815\uD588\uC2B5\uB2C8\uB2E4.'
              );
            }
            rulesAdded = true;
          }
        }
      }
    });
    if (!rulesAdded) {
      const firstObjectLiteral = objectLiterals[0];
      const quoteChar = _getQuoteChar(firstObjectLiteral);
      firstObjectLiteral.addPropertyAssignment({
        name: `${quoteChar}rules${quoteChar}`,
        initializer: `{ ${quoteChar}react/prop-types${quoteChar}: ${quoteChar}off${quoteChar} }`
      });
      console.log('"rules" \uC18D\uC131\uC774 \uC0C8\uB85C \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4.');
    }
    await sourceFile.save();
  } catch (error) {
    console.error("Error loading config:", error);
  }
}
loadConfig();
function _getQuoteChar(configObject) {
  return configObject.getFirstDescendantByKind(SyntaxKind.StringLiteral)?.getQuoteKind() === "'" ? "'" : '"';
}
export {
  _getQuoteChar
};
//# sourceMappingURL=index.js.map