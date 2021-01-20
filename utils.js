'use strict';

const _ = require('lodash');
const j = require('jscodeshift');

const LIA_PREFIX = '[logitall]  ';
const LIA_SUFFIX = '';


/**
 * @name buildConsoleLogExpressionStatement
 * @param {string} logString
 * @returns {Object} A jscodeshift ExpressionStatement node
 * @description This is a convenience method to generate console log expresssions
 */
const buildConsoleLogExpressionStatement = (logString) => {
  const expressionStatement = j.expressionStatement(
    j.callExpression(
      j.identifier('console.log'),
      [j.literal(`${LIA_PREFIX}${logString}${LIA_SUFFIX}`)]
    )
  );

  return expressionStatement;
}
exports.buildConsoleLogExpressionStatement = buildConsoleLogExpressionStatement;

/** @function
 * @name buildAnonymousParamsList
 * @param A list of parameter nodes
 * @returns {string} A string representation of function parameters
 */
const buildAnonymousParamsList = (paramNodes) => {
  let paramString = '(';

  for (let index = 0; index < paramNodes.length; index++) {
    paramString = paramString + paramNodes[index].name;

    if (index !== (paramNodes.length - 1)) {
      paramString = paramString + ', ';
    }
  }

  paramString = paramString + ')';
  return paramString;
}
exports.buildAnonymousParamsList = buildAnonymousParamsList;

/** @function
 * @name @buildParamLoggingList
 * @param { Object } paramNodes A list of parameter nodes
 * @returns { Object } An array of nodes representing a console.log() node for each paraemter
 */
const buildParamLoggingList = (paramNodes, relPathToFile, linenum, functionName) => {
  const returnExpressionNodes = [];
  for (let index = 0; index < paramNodes.length; index++) {
    let currentNode = paramNodes[index];

    // This part is to deal with situations where we're handed a TypeScript parameter with a type annotion.
    // If this is this case, then there's an additional "left" parent attribute that needs to be accessed
    // e.g.
    let currentNodeName = _.get(currentNode, 'left.name', currentNode.name);

    let announcement = `${LIA_PREFIX}\t${relPathToFile}:${linenum}${functionName}:param ${currentNodeName} value:${LIA_SUFFIX} \n\t\t\t\t\t\t\t\t\t\t`;

    let quasis = [
      j.templateElement({ cooked: announcement, raw: announcement }, true),
    ];

    let stringifyCallExpression = j.callExpression(j.identifier('JSON.stringify'), [j.identifier(currentNodeName)]);
    let logTemplateLiteral = j.templateLiteral(quasis, [stringifyCallExpression]);
    let consoleCallExpression = j.callExpression(j.identifier('console.log'), [logTemplateLiteral]);
    let expressionStatement = j.expressionStatement(consoleCallExpression);

    returnExpressionNodes.push(expressionStatement);
  }

  return returnExpressionNodes;
}
exports.buildParamLoggingList = buildParamLoggingList;

/** @function
 * @name printRxjsPipeStageLogFunction
 * @param {number} totalPipeParameters The total number of page parameters
 * @param {number} pipeStageIndex The number value
 * @param {number} pipeStartLineNumber The line number the pipe statement starts at
 * @param {string} filepath The absolute path of the file
 * @param {string} relativeFilePath The file path relative to the current location from which logitall is run
 * @returns {Object} A jscodeshift ArrowFunction object prints the pipe state and value
 *
 *
 * The end result of this function should a jscodeshift ArrowFunction object
 * that when rendered looks like the following

      x => {
        console.log(`Stage 1 value for pipe at line 1 is: ${x}\n`);
      }
  */
const printRxjsPipeStageLogFunction = (totalPipeParameters, pipeStageIndex, pipeStartLineNumber, filepath, relativeFilePath) => {
  let announcement = '';
  let relPathToFile = calculatedRelPath(filepath, relativeFilePath);

  if (totalPipeParameters === pipeStageIndex) {
    announcement = `${LIA_PREFIX}Final value for rxjs pipe starting at line ${pipeStartLineNumber} in ${relPathToFile} is:\n`;
  } else {
    announcement = `${LIA_PREFIX}Stage ${pipeStageIndex} value for rxjs pipe starting at line ${pipeStartLineNumber} in ${relPathToFile} is:\n`;
  }

  let quasis = [
    j.templateElement({ cooked: announcement, raw: announcement }, true),
    j.templateElement({ cooked: '\\n', raw: '\\n' }, true)
  ];

  let expressions = [j.callExpression(j.identifier('JSON.stringify'), [j.identifier('x')])];
  let logTemplateLiteral = j.templateLiteral(quasis, expressions);

  let expressionStatement = j.expressionStatement(j.callExpression(j.identifier('console.log'), [logTemplateLiteral]))
  let arrowFunction = j.arrowFunctionExpression([j.identifier('x')],
    j.blockStatement([expressionStatement]));
  return arrowFunction;
}
exports.printRxjsPipeStageLogFunction = printRxjsPipeStageLogFunction;


/** @function
 * @name hasSuper
 * @param A jscodeshift path
 * @returns {boolean} True/false value as to whether there's a super call in the constructor
 *
 * Checks whether there's a super call that will require the log statement to be put immediately after it
*/
const hasSuper = (p) => {
  let returnSuper = false;

  if (_.get(p, 'expression.type', false)) {
    let calleeType = _.get(p, 'expression.callee.type', '');
    if (calleeType === 'Super') {
      returnSuper = true;
    }
  }

  return returnSuper;
}
exports.hasSuper = hasSuper;

/** @function
 * @name calculatedRelPath
 * @param fullpath String value with the absolute path
 * @param relpath A String value with the relative path
 * @returns {string} A shortened version of the absolute path
 *
 * Whittles down the absolute path into something more managable
 * to look at in console.log() statements
 */
const calculatedRelPath = (fullpath, relpath) => {
  let foundIndex = fullpath.search(relpath);
  let relPathToFile = fullpath.substring(foundIndex);
  return relPathToFile;
}
exports.calculatedRelPath = calculatedRelPath;

/** @function
 * @name getFunctionStartLineNumber
 * @param path A jscodeshift path
 * @returns {integer} The functions starting line number
 *
 * Convenience function that returns the starting line number from a
 * jscodeshift path
*/
const getFunctionStartLineNumber = (path) => {
  return path.node.body.loc.start.line;
}
exports.getFunctionStartLineNumber = getFunctionStartLineNumber;

/** @function
 * @name findTapImport
 * @param path A jscodeshift node
 * @returns {boolean} Flag whether there's an existing rxjs tap operator
 *
 * This function is used as a filter function on ImportDeclaration nodes
 * to find out whether the ImportDeclaration imports the rxjs tap operator
*/
const findTapImport = (path) => {
  let tapImportExists = false;
  path.find(j.ImportDeclaration)
    .forEach(p => {
      let importSource = _.get(p, 'node.source.value');
      if ((importSource === 'rxjs/operators') ||
        (importSource === 'rxjs/internal/operators')) {
        _.find(p.node.specifiers, x => {
          let importName = _.get(x, 'imported.name', '');
          if (importName === 'tap') {
            tapImportExists = true;
          }
        })
      }
    });

  return tapImportExists;
}
exports.findTapImport = findTapImport;
