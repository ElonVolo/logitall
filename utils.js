'use strict';

const _ = require('lodash');
const j = require('evcodeshift');
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const LIA_PREFIX = '[logitall]  ';
const LIA_SUFFIX = '';

// leaving below describe in here for future easy troubleshooting
// var describe = require('jscodeshift-helper').describe;

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
 * @name buildParamsListString
 * @param A list of parameter nodes
 * @returns {string} A string representation of function parameters
 */
const buildParamsListString = (paramNodes) => {
  let paramString = '(';

  for (let index = 0; index < paramNodes.length; index++) {
    let currentNode = paramNodes[index];
    let currentNodeName;

    // If the first parameter is a destructured object (aka ObjectPattern)
    // i.e. { bunny, bubba, babushka } in 
    if (currentNode.type === 'ObjectPattern') {
      let propertiesString = '{';
      if (currentNode.properties.length > 0) {
        for (let propertyIndex = 0; propertyIndex < currentNode.properties.length; propertyIndex++) {
          let currentProperty = currentNode.properties[propertyIndex];
          propertiesString = propertiesString + currentProperty.key.name;
          if (propertyIndex < (currentNode.properties.length - 1)) {
            propertiesString = propertiesString + ', ';
          }
        }
      }

      propertiesString = propertiesString += '}';
      currentNodeName = propertiesString;
      // paramString = paramString + propertiesString;
    } else if (!currentNode.name && currentNode.type === 'RestElement') {
      // The solution is to descend into the RestElement and get the child identifier
      currentNodeName = '...' + currentNode.argument.name;
    } else {
      currentNodeName = currentNode.name;
    }

    // Deal with situations where there's a rest element
    paramString = paramString + currentNodeName;

    // append a command and space if we're not at the last parameter yet
    if (index !== (paramNodes.length - 1)) {
      paramString = paramString + ', ';
    }
  }

  paramString = paramString + ')';
  return paramString;
}
exports.buildParamsListString = buildParamsListString;

/** @function
 * @name buildParamLoggingStatement
 * @param { String } parameterName The name of the variable
 * @param { String } relPathToFile The relative path to the file
 * @param { String } linenum The line number
 * @param { String } functionName The name of the function being logged.
 * @returns { Object } An expression object that translates into console.logging the parameter name and value
 * @description Convenience function that does the heavy lifting of creating the expression that console.logs the parameter name and value
 */
 const buildParamLoggingStatement = (parameterName, relPathToFile, linenum, functionName) => {
  let announcement = `${LIA_PREFIX}\t${relPathToFile}:${linenum}${functionName}:param ${parameterName} value:${LIA_SUFFIX} \n\t\t\t\t\t\t\t\t\t\t`;

  let quasis = [
    j.templateElement({ cooked: announcement, raw: announcement }, true),
  ];

  // The below call expressions gives us "decycle(foo)""
  let decycleExp = j.callExpression(j.identifier('decycle'), [j.identifier(parameterName)]);

  // The below call expressions gives us "JSON.stringify(decycle(foo))"
  let stringifyCallExpression = 
    j.callExpression(j.identifier('JSON.stringify'), [decycleExp]);

  // The below gives us something like
  //   `[logitall]  	__testfixtures__/function-anonymous-logparams.input.ts:1::param paramOne value: 
  //     ${JSON.stringify(decycle(paraobjmOne))}`
  let logTemplateLiteral = j.templateLiteral(quasis, [stringifyCallExpression]);

  let consoleCallExpression = j.callExpression(j.identifier('console.log'), [logTemplateLiteral]);
  let expressionStatement = j.expressionStatement(consoleCallExpression);
  return expressionStatement;
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

    // Fix for situation where Babel does something weird and parses ts constructor function
    // parameters as TSParameterProperty node if there's an access modifier (private, public, etc)

    // I honestly don't know what I was doing here or what was the goal, but this
    // is probably important enough that I'm going to leave it in here until it
    // comes up again. This is just to give me some sort of context for when I
    // am trying to solve the problem that I was trying to solve previously,
    // that again, I don't remember what was



    // If the parameter contains no TypeScript access modifier (i.e. private, public, etc), e.g. constructor(myVar:number)
    // Babel parses the function parameter, myVar, into an Identifier type node
    // However, if the parameter does have a TypeScript access modifier, e.g. constructor(private myVar:number)  
    // Babel parses the function parameter node into a TSParameterProperty node
    // So in that case we need to dig one level deeper to get the name of the parameter.
    if (!currentNodeName && currentNode.type === 'TSParameterProperty') {
      // The solution is to get TSParameterProperty.paramter.name or some variation of that

      // Check to see if this is TypeScript with an assigment, e.g.
      // export class HttpHandler {

      //   constructor(
      //     protected routes = 5,
      //   ) {
      //     let q = 5;
      //   }
      // }
      // 
      // If so, then go get routes we need to do theTypeScriptNode.parameter.left.name;
      if (currentNode.parameter.type == 'AssignmentPattern') {
        currentNodeName = currentNode.parameter.left.name;
      } else {
        currentNodeName = currentNode.parameter.name;
      }
    }

    if (currentNode.type == 'ObjectPattern') {
      // Using https://simonsmith.io/destructuring-objects-as-function-parameters-in-es6 as a guide

      if (currentNode.properties) {
        for (let propIndex = 0; propIndex < currentNode.properties.length; propIndex++) {
          let currentProperty = currentNode.properties[propIndex];

          /*
            Check if extracted values are being renamed. For example, in the case where we have the following

            function myFunc({someLongPropertyName: myval}) {
              doStuff(prop);
            }

            as far as the AST is concerned, as usual destructuring ObjectPattern, e.g. for({myval}) will have both the Property
            key Identifier node and the Property value Identifier node as both having the name "myval". But for myfunc() above, 
            the Property's key, someLongPropertyName, has an Identifier node with the name someLongPropertyName and the Property's 
            value, myval, which is what we actually want to print to console, has an Identifier with the name "myval".

            So we do a check that's key.name === value.name ? key.name : value.name

            as the property value. So we need to do a check where we say "usually use the key as the name of the variable we want to
            console.log() out to the console, but in the case where the key and the value"
          */
          let currPropertyName;

          if (currentProperty.value.type === 'Identifier') {
            if (currentProperty.key.name === currentProperty.value.name) {
              currPropertyName = currentProperty.key.name;
            } else {
              currPropertyName = currentProperty.value.name;
            }
          } else if (currentProperty.value.type === 'AssignmentPattern') {
            // If we have a default assignment using the destructuring idiom,
            // e.g.
            //
            // function camel({name = 'Default user', age = 'N/A'} = {name: "asdf"}) {
            //  
            // }
            //
            // Then we have an assignment pattern that we have to dig into to get the 
            // param values
            currPropertyName = currentProperty.value.left.name;
          }

          let paramLoggingStatement = buildParamLoggingStatement(currPropertyName, relPathToFile, linenum, functionName);
          returnExpressionNodes.push(paramLoggingStatement);
        }
      }      
    } else {
      // If we have a rest parameter (i.e. a ...myParamName in the following:
      //  function doStuff(...myParamName) {
      //
      //  }

      // Then Babel will end up putting a RestElement in the params[] array,
      if (!currentNodeName && currentNode.type === 'RestElement') {
        // The solution is to descend into the RestElement and get the child identifier
        currentNodeName = currentNode.argument.name;
      }

      let paramLoggingStatement = buildParamLoggingStatement(currentNodeName, relPathToFile, linenum, functionName);    
      returnExpressionNodes.push(paramLoggingStatement);
    }
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

  let decycleExp = j.callExpression(j.identifier('decycle'), [j.identifier('x')]);

  let stringifyCallExpression 
    = j.callExpression(j.identifier('JSON.stringify'), [decycleExp]);

  let logTemplateLiteral = j.templateLiteral(quasis, [stringifyCallExpression]);

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

/** @function
 * @name circularRefHandlerCode
 * This function returns a string with code that needs
 * to be added at the top of a source code file to deal with
 * any circularly references that JSON.stringify could get
 * held up on
*/
const circularRefHandlerCode = () => {
  // The secret of how this code below works.
  //
  // We go into node_modules/json-cycle/cycle.js and do a jscodeshift
  // find on the decycle() function, then we grab it and minify it and inject
  // the result of that into our codemod program
  
  // Get the AST node for decycle()
  let cyclePath = path.join(__dirname, 'node_modules/json-cycle/cycle.js');
  let cycleCodeString = fs.readFileSync(cyclePath, 'utf-8');
  let cycleRoot = j(cycleCodeString);
  let decycleFunction = cycleRoot.find(j.FunctionDeclaration, { 'id' : {'name' : 'decycle'}});
  let decycleFunctionNode = (decycleFunction.get(0)).node;

  // Now make a new standalone chunk of code from the decycle() function
  // and minify that so it can be prepended to code at the top of the file
  const newCode = j('');
  let newProgram = newCode.find('Program');
  let newNodePath = newProgram.get(0).node;
  newNodePath.body.push(decycleFunctionNode);
  let newSource =  newCode.toSource({quote:'single'});

  let transformed = esbuild.transformSync(newSource,{
    minify: true,
  });

  // Add a ts-ignore to prevent TypeScript about complaining
  let tsIgnored = '// @ts-ignore\n';

  let decycleCode = transformed['code'];
  let fullCode = tsIgnored + decycleCode + '\n';
  return fullCode;
}
exports.circularRefHandlerCode = circularRefHandlerCode;
