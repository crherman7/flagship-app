import path from 'path';
import fs from 'fs';

import type * as Babel from '@babel/core';
import {cosmiconfigSync, defaultLoadersSync} from 'cosmiconfig';

const NODE_PROCESS_IDENTIFIER = 'process';
const NODE_PROCESS_ENV_IDENTIFIER = 'env';
const FLAGSHIP_APP_ENV_IDENTIFIER = 'FLAGSHIP_APP_ENV';
const MODULE_NAME = '.flagshipappenvrc';

export default function ({types: t}: typeof Babel): Babel.PluginObj {
  const explorerSync = cosmiconfigSync(MODULE_NAME);
  const result = explorerSync.search(process.cwd());

  if (result === null || result.isEmpty) {
    throw new Error('unable to find .flagshipappenvrc configuration file');
  }

  const envFiles = fs
    .readdirSync(path.resolve(process.cwd(), result.config.path))
    .filter(it => /^env\.\w+\.ts/gm.test(it))
    .map(file => {
      return path.resolve(process.cwd(), result.config.path, file);
    });

  const envs = envFiles.reduce((acc, curr) => {
    const env = defaultLoadersSync['.ts'](curr, fs.readFileSync(curr, 'utf-8'));

    const envName = curr.split('/').reverse()[0].split('.')[1];

    return {...acc, [envName]: env};
  }, {});

  function convertToBabelAST(value: Object): any {
    if (Array.isArray(value)) {
      return t.arrayExpression(value.map(convertToBabelAST));
    } else if (value === null) {
      return t.nullLiteral();
    } else if (typeof value === 'undefined') {
      return t.identifier('undefined');
    } else if (typeof value === 'boolean') {
      return t.booleanLiteral(value);
    } else if (typeof value === 'number') {
      return t.numericLiteral(value);
    } else if (typeof value === 'string') {
      return t.stringLiteral(value);
    } else if (typeof value === 'object') {
      // Handle objects
      const properties = Object.keys(value).map(key => {
        const propValue = convertToBabelAST((value as any)[key]) as any;
        return t.objectProperty(t.stringLiteral(key), propValue);
      });

      return t.objectExpression(properties);
    } else {
      throw new Error(`Unsupported type: ${typeof value}`);
    }
  }

  return {
    visitor: {
      MemberExpression({node, parentPath: parent}) {
        // Check if the MemberExpression is accessing process.env
        if (
          !t.isIdentifier(node.object, {name: NODE_PROCESS_IDENTIFIER}) ||
          !t.isIdentifier(node.property, {name: NODE_PROCESS_ENV_IDENTIFIER})
        ) {
          return;
        }
        // Ensure that the MemberExpression has a parent MemberExpression
        if (!t.isMemberExpression(parent.node)) {
          return;
        }

        // Replace process.env.__RECHUNK_USERNAME__ with the rechunk project
        if (
          t.isIdentifier(parent.node.property, {
            name: FLAGSHIP_APP_ENV_IDENTIFIER,
          }) &&
          !parent.parentPath?.isAssignmentExpression()
        ) {
          // TODO: replace with envs object
          parent.replaceWith(convertToBabelAST(envs));
        }
      },
    },
  };
}
