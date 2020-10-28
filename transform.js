var _ = require('lodash');
// var describe = require('jscodeshift-helper').describe;

module.exports = function (fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  const relPath = options['relpath'];
  const namedFunctionsOnly = options['named-functions-only'];
  const rxjsSupport = options['rxjs'];
  const logParamsEnabled = options['params'];

  const LIA_PREFIX = '[logitall]  ';
  const LIA_SUFFIX = '';
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
        let linenum = PRINT_LINE_NUMBERS ? `${getFunctionStartLineNumber(p)}:` : '';

        let relPathToFile = calculatedRelPath(filepath, relPath);

        // Check for super() call
        if (methodBlockBody.length > 0) {
          let hasSuperCall = hasSuper(methodBlockBody[0]);
          if (hasSuperCall) {
            methodBlockBody.splice(1, 0,
              j.expressionStatement(
                j.callExpression(
                  j.identifier('console.log'),
                  [j.literal(`${LIA_PREFIX}${relPathToFile}:${linenum}${methodName}()${LIA_SUFFIX}`)]
                )
              )
            )
          } else {
            if (shouldLogParams) {
              let paramsList = buildParamLoggingList(p.node.params, relPathToFile, linenum, '');

              // Reverse the paramList, as we're unshifted from last parameter to first
              let reversedParamList = paramsList.reverse();

              for (const currParam of reversedParamList) {
                methodBlockBody.unshift(currParam);
              }
            }

            methodBlockBody.unshift(
              j.expressionStatement(
                j.callExpression(
                  j.identifier('console.log'),
                  [j.literal(`${LIA_PREFIX}${relPathToFile}:${linenum}${methodName}()${LIA_SUFFIX}`)]
                )
              )
            )
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

        const paramString = buildAnonymousParamsList(p.node.params);
        let relPathToFile = calculatedRelPath(filepath, relPath);
        let linenum = PRINT_LINE_NUMBERS ? `${getFunctionStartLineNumber(p)}:` : '';

        if (shouldLogParams) {
          let paramsList = buildParamLoggingList(p.node.params, relPathToFile, linenum, functionName);

          // Reverse the paramList, as we're unshifted from last parameter to first
          let reversedParamList = paramsList.reverse();

          for (const currParam of reversedParamList) {
            functionBlockBody.unshift(currParam);
          }
        }

        functionBlockBody.unshift(
          j.expressionStatement(
            j.callExpression(
              j.identifier('console.log'),
              [j.literal(`${LIA_PREFIX}${relPathToFile}:${linenum}${functionName}${paramString}${LIA_SUFFIX}`)]
            )
          )
        );
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

        const paramString = buildAnonymousParamsList(p.node.params);
        let relPathToFile = calculatedRelPath(filepath, relPath);
        let linenum = PRINT_LINE_NUMBERS ? `${getFunctionStartLineNumber(p)}:` : '';

        if (shouldLogParams) {
          let paramsList = buildParamLoggingList(p.node.params, relPathToFile, linenum, '');

          // Reverse the paramList, as we're unshifted from last parameter to first
          let reversedParamList = paramsList.reverse();

          for (const currParam of reversedParamList) {
            functionBlockBody.unshift(currParam);
          }
        }

        functionBlockBody.unshift(
          j.expressionStatement(
            j.callExpression(
              j.identifier('console.log'),
              [j.literal(`${LIA_PREFIX}${relPathToFile}:${linenum}function${paramString}${LIA_SUFFIX}`)]
            )
          )
        )
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
        const paramString = buildAnonymousParamsList(p.node.params);

        let blockStatementBody = _.get(p, 'node.body.body', false);
        let relPathToFile = calculatedRelPath(filepath, relPath);
        let linenum = PRINT_LINE_NUMBERS ? `${getFunctionStartLineNumber(p)}:` : '';

        if (blockStatementBody) {

          // TODO: add handling for arrow functions that return arrow functions
          // let myFunc = stuff => things => {
          //
          // }

          if (Array.isArray(blockStatementBody)) {
            if (shouldLogParams) {
              let paramsList = buildParamLoggingList(p.node.params, relPathToFile, linenum, '');

              // Reverse the paramList, as we're unshifted from last parameter to first
              let reversedParamList = paramsList.reverse();

              for (const currParam of reversedParamList) {
                blockStatementBody.unshift(currParam);
              }
            }

            blockStatementBody.unshift(
              j.expressionStatement(
                j.callExpression(
                  j.identifier('console.log'),
                  [j.literal(`${LIA_PREFIX}${relPathToFile}:${linenum}${paramString} => {}${LIA_SUFFIX}`)]
                )
              )
            )
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

        let relPathToFile = calculatedRelPath(filepath, relPath);
        let linenum = PRINT_LINE_NUMBERS ? `${p.node.loc.start.line}` : '';

        p.insertBefore(
          j.expressionStatement(
            j.callExpression(
              j.identifier('console.log'),
              [j.literal(`${LIA_PREFIX}${relPathToFile}:${linenum}${LIA_SUFFIX}`)]
            )
          )
        );
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

        let relPathToFile = calculatedRelPath(filepath, relPath);
        let linenum = PRINT_LINE_NUMBERS ? `${p.node.loc.start.line}` : '';

        p.insertBefore(
          j.expressionStatement(
            j.callExpression(
              j.identifier('console.log'),
              [j.literal(`${LIA_PREFIX}${relPathToFile}:${linenum}${LIA_SUFFIX}`)]
            )
          )
        );
      })
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
          let tapImportExists = findTapImport(path);

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
          let arrowFunc = printRxjsPipeStageLogFunction(totalPipeParameters, i, lineNumber, filepath);
          let tapExpressionStatement = j.callExpression(j.identifier('tap'), [arrowFunc]);
          newArgArray.push(tapExpressionStatement);
          newArgArray.push(p.node.arguments[i]);
        }

        p.node.arguments = newArgArray;
      })
  }

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

  /** @function
   * @name printRxjsPipeStageLogFunction
   * @param totalPipeParameters The total number of page parameters
   * @param pipeStageIndex The number value
   * @returns {Object} A jscodeshift ArrowFunction object prints the pipe state and value
   *
   *
   * The end result of this function should a jscodeshift ArrowFunction object
   * that when rendered looks like the following

        x => {
          console.log(`Stage 1 value for pipe at line 1 is: ${x}\n`);
        }
   */
  const printRxjsPipeStageLogFunction = (totalPipeParameters, pipeStageIndex, pipeStartLineNumber, filepath) => {
    let announcement = '';
    let relPathToFile = calculatedRelPath(filepath, relPath);

    if (totalPipeParameters === pipeStageIndex) {
      announcement = `${LIA_PREFIX}Final value for rxjs pipe starting at line ${pipeStartLineNumber} in ${relPathToFile} is:\n`;
    } else {
      announcement = `${LIA_PREFIX}Stage ${pipeStageIndex} value for rxjs pipe starting at line ${pipeStartLineNumber} in ${relPathToFile} is:\n`;
    }

    let quasis = [
      j.templateElement({ cooked: announcement, raw: announcement }, true),
      j.templateElement({ cooked: '\\n', raw: '\\n' }, true)
    ];

    let expressions = [j.identifier('x')];
    let logTemplateLiteral = j.templateLiteral(quasis, expressions);

    let expressionStatement = j.expressionStatement(j.callExpression(j.identifier('console.log'), [logTemplateLiteral]))
    let arrowFunction = j.arrowFunctionExpression([j.identifier('x')],
      j.blockStatement([expressionStatement]));
    return arrowFunction;
  }


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
