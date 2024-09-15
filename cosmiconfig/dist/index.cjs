#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  _getQuoteChar: () => _getQuoteChar
});
module.exports = __toCommonJS(src_exports);
var import_cosmiconfig = require("cosmiconfig");
var import_path = __toESM(require("path"), 1);
var import_ts_morph = require("ts-morph");
var import_fs_extra = __toESM(require("fs-extra"), 1);
var explorer = (0, import_cosmiconfig.cosmiconfig)("eslint", {
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
    const fileExtension = import_path.default.extname(filepath);
    const config = result.config;
    if (fileExtension === ".json") {
      config.rules = config.rules || {};
      config.rules["react/prop-types"] = "off";
      await import_fs_extra.default.writeJSON(filepath, config, { spaces: 2 });
      return;
    }
    const project = new import_ts_morph.Project();
    if (Array.isArray(config)) {
      const sourceFile2 = project.addSourceFileAtPath(filepath);
      const arrayExpressions = sourceFile2.getDescendantsOfKind(
        import_ts_morph.SyntaxKind.ArrayLiteralExpression
      );
      let rulesPropertyFound = false;
      if (arrayExpressions.length > 0) {
        arrayExpressions.forEach((arrayExpression) => {
          const objectLiterals2 = arrayExpression.getElements().filter(
            (element) => element.getKind() === import_ts_morph.SyntaxKind.ObjectLiteralExpression
          );
          objectLiterals2.forEach((objectLiteralExpression) => {
            const objectLiteral = objectLiteralExpression.asKind(
              import_ts_morph.SyntaxKind.ObjectLiteralExpression
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
                    import_ts_morph.SyntaxKind.ObjectLiteralExpression
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
            const firstObjectLiteral = arrayExpression.getElements()[0].asKind(import_ts_morph.SyntaxKind.ObjectLiteralExpression);
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
      import_ts_morph.SyntaxKind.ObjectLiteralExpression
    );
    let rulesAdded = false;
    objectLiterals.forEach((objectLiteral) => {
      if (objectLiteral instanceof import_ts_morph.ObjectLiteralExpression) {
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
  return configObject.getFirstDescendantByKind(import_ts_morph.SyntaxKind.StringLiteral)?.getQuoteKind() === "'" ? "'" : '"';
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  _getQuoteChar
});
//# sourceMappingURL=index.cjs.map