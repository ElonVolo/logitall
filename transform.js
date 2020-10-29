'use strict';

const _ = require('lodash');
const utils = require('./utils');

// leaving below describe in here for future easy troubleshooting
// var describe = require('jscodeshift-helper').describe;
module.exports = function (fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  const relPath = options['relpath'];
  const namedFunctionsOnly = options['named-functions-only'];
  const rxjsSupport = options['rxjs'];
  const logParamsEnabled = options['params'];

  const PRINT_LINE_NUMBERS = true;

  /** @function
   * @name addLoggingToTSMethods
   * @param {Object} jscodeshift node-path
   * @param {string} filepath The path to the file being transformed
   * @param {boolean} shouldLogParams Set to true to log function parameters
   * @description Adds logging to typescript methods, including constructors
   */
  const addLoggingToTSMethods = (path, filepath, shouldLogParams) => {
    path.find(j.ClassMethod)
      .forEach(p => {

        let methodName = p.node.key.name;
        let methodBlockBody = p.node.body.body;
        let linenum = PRINT_LINE_NUMBERS ? `${utils.getFunctionStartLineNumber(p)}:` : '';

        let relPathToFile = utils.calculatedRelPath(filepath, relPath);

        // Check for super() call
        if (methodBlockBody.length > 0) {
          let hasSuperCall = utils.hasSuper(methodBlockBody[0]);

          if (hasSuperCall) {
            let logString = `${relPathToFile}:${linenum}${methodName}()`;
            let logStatement = utils.buildConsoleLogExpressionStatement(logString);
            methodBlockBody.splice(1, 0, logStatement);
          } else {
            if (shouldLogParams) {
              let paramsList = utils.buildParamLoggingList(p.node.params, relPathToFile, linenum, '');

              // Reverse the paramList, as we're unshifted from last parameter to first
              let reversedParamList = paramsList.reverse();

              for (const currParam of reversedParamList) {
                methodBlockBody.unshift(currParam);
              }
            }

            let logString = `${relPathToFile}:${linenum}${methodName}()`;
            let logStatement = utils.buildConsoleLogExpressionStatement(logString);
            methodBlockBody.unshift(logStatement);
          }
        }
      })
  }

  /** @function
   * @name addLoggingToFunctionDeclarations
   * @param {Object} jscodeshift node-path
   * @param {string} filepath The path to the file being transformed
   * @param {boolean} shouldLogParams Set to true to log function parameters
   * @description Adds logging to officially declared functions
   */
  const addLoggingToFunctionDeclarations = (path, filepath, shouldLogParams) => {
    path.find(j.FunctionDeclaration)
      .forEach(p => {
        let functionBlockBody = p.node.body.body;
        let functionName = p.node.id.name;

        const paramString = utils.buildAnonymousParamsList(p.node.params);
        let relPathToFile = utils.calculatedRelPath(filepath, relPath);
        let linenum = PRINT_LINE_NUMBERS ? `${utils.getFunctionStartLineNumber(p)}:` : '';

        if (shouldLogParams) {
          let paramsList = utils.buildParamLoggingList(p.node.params, relPathToFile, linenum, functionName);

          // Reverse the paramList, as we're unshifted from last parameter to first
          let reversedParamList = paramsList.reverse();

          for (const currParam of reversedParamList) {
            functionBlockBody.unshift(currParam);
          }
        }

        let logString = `${relPathToFile}:${linenum}${functionName}${paramString}`;
        let logStatement = utils.buildConsoleLogExpressionStatement(logString);
        functionBlockBody.unshift(logStatement);
      });
  }

  /** @function
   * @name addLoggingToAnonymousFunctions
   * @param {Object} jscodeshift node-path
   * @param {string} filepath The path to the file being transformed
   * @param {boolean} shouldLogParams Set to true to log function parameters
   * @description Adds logging to anonymous functions
   */
  const addLoggingToAnonymousFunctions = (path, filepath, shouldLogParams) => {
    path.find(j.FunctionExpression)
      .forEach(p => {
        let functionBlockBody = p.node.body.body;

        const paramString = utils.buildAnonymousParamsList(p.node.params);
        let relPathToFile = utils.calculatedRelPath(filepath, relPath);
        let linenum = PRINT_LINE_NUMBERS ? `${utils.getFunctionStartLineNumber(p)}:` : '';

        if (shouldLogParams) {
          let paramsList = utils.buildParamLoggingList(p.node.params, relPathToFile, linenum, '');

          // Reverse the paramList, as we're unshifted from last parameter to first
          let reversedParamList = paramsList.reverse();

          for (const currParam of reversedParamList) {
            functionBlockBody.unshift(currParam);
          }
        }

        let logString = `${relPathToFile}:${linenum}function${paramString}`;
        let logStatement = utils.buildConsoleLogExpressionStatement(logString);
        functionBlockBody.unshift(logStatement);
      });
  }

  /** @function
   * @name addLoggingToArrowFunctions
   * @param {Object} jscodeshift node-path
   * @param {string} filepath The path to the file being transformed
   * @param {boolean} shouldLogParams Set to true to log function parameters
   * @description Adds logging to fat arrow functions
   */
  const addLoggingToArrowFunctions = (path, filepath, shouldLogParams) => {
    path.find(j.ArrowFunctionExpression)
      .forEach(p => {
        const paramString = utils.buildAnonymousParamsList(p.node.params);

        let blockStatementBody = _.get(p, 'node.body.body', false);
        let relPathToFile = utils.calculatedRelPath(filepath, relPath);
        let linenum = PRINT_LINE_NUMBERS ? `${utils.getFunctionStartLineNumber(p)}:` : '';

        if (blockStatementBody) {

          // TODO: add handling for arrow functions that return arrow functions
          // let myFunc = stuff => things => {
          //
          // }

          if (Array.isArray(blockStatementBody)) {
            if (shouldLogParams) {
              let paramsList = utils.buildParamLoggingList(p.node.params, relPathToFile, linenum, '');

              // Reverse the paramList, as we're unshifted from last parameter to first
              let reversedParamList = paramsList.reverse();

              for (const currParam of reversedParamList) {
                blockStatementBody.unshift(currParam);
              }
            }

            let logString = `${relPathToFile}:${linenum}${paramString} => {}`;
            let logStatement = utils.buildConsoleLogExpressionStatement(logString);
            blockStatementBody.unshift(logStatement);
          }
        } else if (_.get(p, 'node.body', false)) {
          // TODO: fix the handling for single line arrow functions
          // e.g. const myFun = id => 5
          //
          // describe(p.parent);
          // p.parent.insertBefore(
          //     j.expressionStatement(
          //         j.callExpression(
          //             j.identifier('console.log'),
          //             [ j.literal(`${LIA_SUFFIX}${relPathToFile}:${p.node.body.loc.start.line}:${paramString} => {}${LIA_SUFFIX}`)]
          //         )
          //     )
          // )
        }
      });
  }

  /** @function
   * @name addLoggingToReturnStatement
   * @param {Object} jscodeshift node-path
   * @param {string} filepath The path to the file being transformed
   * @description Adds a logging line before each seperate statement line
   */
  const addLoggingToExpressionStatement = (path, filepath) => {
    path.find(j.ExpressionStatement)
      .forEach(p => {
        // Ignore console logs that either are already in the code
        // or that logitall has recently inserted into the AST
        // First we check if what we're looking at is a function or method,${LIA_SUFFIX}
        // and then we see if the function name is 'console.log'. If the
        // function call is a console.log, then we skip this ExpressionStatement
        // and move on to the next one.
        let expressionType = _.get(p, 'node.expression.type', '');
        if (expressionType === 'CallExpression') {
          let functionName = _.get(p, 'node.expression.callee.name', '');
          if (functionName === 'console.log') {
            return;
          }

          // Check to see whether the function is a Super initializer function.
          // If so, skip to the next
          let functionType = _.get(p, 'node.expression.callee.type', '');
          if (functionType === 'Super') {
            return;
          }
        }

        // Skip instances where the expression statement is the consequent of an if statment
        // where the braces have been omitted
        // if (foo === 5)
        //     bar = baz;
        let nodeType = _.get(p, 'parent.node.type', '');
        if (nodeType === 'IfStatement') {
          return;
        }

        let relPathToFile = utils.calculatedRelPath(filepath, relPath);
        let linenum = PRINT_LINE_NUMBERS ? `${p.node.loc.start.line}` : '';

        let logString = `${relPathToFile}:${linenum}`;
        let logStatement = utils.buildConsoleLogExpressionStatement(logString);
        p.insertBefore(logStatement);
      })
  }

  /** @function
   * @name addLoggingToReturnStatement
   * @param {Object} jscodeshift node-path
   * @param {string} filepath The path to the file being transformed
   * @description Adds a logging line before a return statement
   */
  const addLoggingToReturnStatement = (path, filepath) => {
    path.find(j.ReturnStatement)
      .forEach(p => {
        // Skip instances where the return statement is the consequent of an if statment
        // where the braces have been omitted
        // if (thing.foo === bar) return thing
        let nodeType = _.get(p, 'parent.node.type', '');
        if (nodeType === 'IfStatement') {
          return;
        }

        let relPathToFile = utils.calculatedRelPath(filepath, relPath);
        let linenum = PRINT_LINE_NUMBERS ? `${p.node.loc.start.line}` : '';

        let logString = `${relPathToFile}:${linenum}`;
        let logStatement = utils.buildConsoleLogExpressionStatement(logString);
        p.insertBefore(logStatement);
      });
  }

  /** @function
   * @name addLoggingToRxjsPipes
   * @param {Object} jscodeshift node-path
   * @param {string} filepath The path to the file being transformed
   * @description Adds logging statements before and after each rxjs pipe stage.
   */
  const addLoggingToRxjsPipes = (path, filepath) => {
    let pipeStatementFound = false;

    // Note: this filter function form is undocumented in jscodeshift (you have to read the code for
    // matchNode()) but basically we're using it to target situations where either the pipe() function is
    // being called as a member function or it is being assigned to a variable
    const pipeFilter = (theNode) => {
      if (_.get(theNode, 'callee.property.name') === 'pipe') {
        // Returns true in cases where pipe is being called as a member
        // .e.g of(1,2,3).ipe(
        //   map(x => {

        //   })
        // )p
        return true;
      } else if (_.get(theNode, 'callee.name') === 'pipe') {
        // Returns true in cases where pipe is being assigned as a variable
        // .e.g. let myPipe = pipe(
        //   map(x => {

        //   })
        // )
        return true;
      } else {
        return false;
      }
    }

    path.find(j.CallExpression, pipeFilter)
      .forEach(p => {

        // Now we the initial import of the tap
        // If the variable denoting that this file has rxjs pipe statements has not yet been set to true,
        // which will be the case if this is the first set of pipe expressions we've found in the file,
        // then go ahead and set that to true. The goal for this below block of code is that we only want to
        // add the code for adding the import statement for the tap() function either:
        //  • 0 times (because the original author of the code that's being modified already used tap
        //  • Exactly 1 time. Because we don't want a zillion identical and redundant import statements
        //
        if (!pipeStatementFound) {
          pipeStatementFound = true;
          let tapImportExists = utils.findTapImport(path);

          if (tapImportExists === false) {
            // If the tap import hasn't been added, then go ahead and add it
            let program = path.get(0).node.program;
            let programBody = program.body;
            let importSpec = j.importSpecifier(j.identifier('tap'));
            let importDecl = j.importDeclaration([importSpec], j.stringLiteral('rxjs/operators'));
            programBody.unshift(importDecl);
          }
        }

        let newArgArray = [];

        // In this case p.node.arguments represents each parameter (i.e. rxjs operator) that's
        // passed to the pipe(). So for each rxjs operator passed to pipe we insert
        // a tap() logging statement before it to capture what the value will be of what that
        // rxjs operator is about to manipulate. Also, note we add the + 1 in the for loop, so
        // we log what the final state of the data is after it's run through the rxjs pipe().
        let totalPipeParameters = p.node.arguments.length;

        // Adding 1, which effectively adds a tap() entry after the last pipe parameter, so the user
        // the final data before any subscribe() call will be logged.
        let totalPipeParametersPlusFinished = totalPipeParameters + 1;

        for (let i = 0; i < totalPipeParametersPlusFinished; i++) {
          let lineNumber = p.node.loc.start.line;
          let arrowFunc = utils.printRxjsPipeStageLogFunction(totalPipeParameters, i, lineNumber, filepath, relPath);
          let tapExpressionStatement = j.callExpression(j.identifier('tap'), [arrowFunc]);
          newArgArray.push(tapExpressionStatement);
          newArgArray.push(p.node.arguments[i]);
        }

        p.node.arguments = newArgArray;
      })
  }

  // MAIN SECTION
  addLoggingToTSMethods(root, fileInfo.path, logParamsEnabled);
  addLoggingToFunctionDeclarations(root, fileInfo.path, logParamsEnabled);

  if (!namedFunctionsOnly) {
    addLoggingToArrowFunctions(root, fileInfo.path, logParamsEnabled);
    addLoggingToAnonymousFunctions(root, fileInfo.path, logParamsEnabled);
    addLoggingToExpressionStatement(root, fileInfo.path);
    addLoggingToReturnStatement(root, fileInfo.path);
  }

  if (rxjsSupport) {
    addLoggingToRxjsPipes(root, fileInfo.path);
  }

  return root.toSource();
}
