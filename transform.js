var _ = require('lodash');
var describe = require('jscodeshift-helper').describe;

module.exports = function(fileInfo, api, options) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
    const relPath = options['relpath'];

    const LIA_PREFIX = '[logitall]  ';
    const LIA_SUFFIX = '';
    const PRINT_LINE_NUMBERS = true;

    const addLoggingToTSMethods = (path, filepath) => {
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
                                    [ j.literal(`${LIA_PREFIX}${relPathToFile}:${linenum}${methodName}()${LIA_SUFFIX}`)]
                                )
                            )
                        )
                    } else {
                        methodBlockBody.unshift(
                            j.expressionStatement(
                                j.callExpression(
                                    j.identifier('console.log'),
                                    [ j.literal(`${LIA_PREFIX}${relPathToFile}:${linenum}${methodName}()${LIA_SUFFIX}`)]
                                )
                            )
                        )
                    }
                }
            })
    }

    const addLoggingToFunctionDeclarations = (path, filepath) => {
        path.find(j.FunctionDeclaration)
        .forEach(p => {
            let functionBlockBody = p.node.body.body;
            let functionName = p.node.id.name;

            const paramString = buildAnonymousParamsList(p.node.params);
            let relPathToFile = calculatedRelPath(filepath, relPath);
            let linenum = PRINT_LINE_NUMBERS ? `${getFunctionStartLineNumber(p)}:` : '';

            functionBlockBody.unshift(
                j.expressionStatement(
                    j.callExpression(
                        j.identifier('console.log'),
                        [ j.literal(`${LIA_PREFIX}${relPathToFile}:${linenum}${functionName}${paramString}${LIA_SUFFIX}`)]
                    )
                )
            );
        });
    }

    const addLoggingToAnonymousFunctions = (path, filepath) => {
        path.find(j.FunctionExpression)
        .forEach(p => {
            let functionBlockBody = p.node.body.body;

            const paramString = buildAnonymousParamsList(p.node.params);
            let relPathToFile = calculatedRelPath(filepath, relPath);
            let linenum = PRINT_LINE_NUMBERS ? `${getFunctionStartLineNumber(p)}:` : '';

            functionBlockBody.unshift(
                j.expressionStatement(
                    j.callExpression(
                        j.identifier('console.log'),
                            [ j.literal(`${LIA_PREFIX}${relPathToFile}:${linenum}function${paramString}${LIA_SUFFIX}`)]
                    )
                )
            )
        });
    }

    const addLoggingToArrowFunctions = (path, filepath) => {
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
                    blockStatementBody.unshift(
                        j.expressionStatement(
                            j.callExpression(
                                j.identifier('console.log'),
                                    [ j.literal(`${LIA_PREFIX}${relPathToFile}:${linenum}${paramString} => {}${LIA_SUFFIX}`)]
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

    const addLoggingToExpressionStatement = (path, filepath) => {
        path.find(j.ExpressionStatement)
            .forEach(p => {
                // Ignore console logs that either are already in the code
                // or that logitall has recently inserted into the AST
                // First we check if what we're looking at is a function or method,
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
                                [ j.literal(`${LIA_PREFIX}${relPathToFile}:${linenum}${LIA_SUFFIX}`)]
                        )
                    )
                );
            })
    }

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
                                [ j.literal(`${LIA_PREFIX}${relPathToFile}:${linenum}${LIA_SUFFIX}`)]
                        )
                    )
                );
            })
    }

    // UTILITY METHODS
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

    const hasSuper = (p) => {
        // Checks whether there's a super call that will require the log statement to be put
        // immediately after it
        let returnSuper = false;

        if (_.get(p, 'expression.type', false)) {
            let calleeType = _.get(p, 'expression.callee.type', '');
            if (calleeType === 'Super') {
                returnSuper = true;
            }
        }

        return returnSuper;
    }

    const calculatedRelPath = (fullpath, relpath) => {
        let foundIndex = fullpath.search(relpath);
        let relPathToFile = fullpath.substring(foundIndex);
        return relPathToFile;
    }

    const getFunctionStartLineNumber = (path) => {
        return path.node.body.loc.start.line;
    }

    addLoggingToTSMethods(root, fileInfo.path);
    addLoggingToFunctionDeclarations(root, fileInfo.path);
    addLoggingToArrowFunctions(root, fileInfo.path);
    addLoggingToAnonymousFunctions(root, fileInfo.path);
    addLoggingToExpressionStatement(root, fileInfo.path);
    addLoggingToReturnStatement(root, fileInfo.path);

    return root.toSource();
}