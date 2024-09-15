#!/usr/bin/env node
import { ObjectLiteralExpression } from 'ts-morph';

declare function _getQuoteChar(configObject: ObjectLiteralExpression): string;

export { _getQuoteChar };
