import type * as Babel from '@babel/core';

const flagshipAppEnvIdentifer = 'FLAGSHIP_APP_ENV';

export default function ({types: t}: typeof Babel): Babel.PluginObj {
  return {
    visitor: {
      MemberExpression({node, parentPath: parent}) {
        // Check if the MemberExpression is accessing process.env
        if (
          !t.isIdentifier(node.object, {name: 'process'}) ||
          !t.isIdentifier(node.property, {name: 'env'})
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
            name: flagshipAppEnvIdentifer,
          }) &&
          !parent.parentPath?.isAssignmentExpression()
        ) {
          // TODO: replace with envs object
          parent.replaceWith(t.stringLiteral(''));
        }
      },
    },
  };
}
