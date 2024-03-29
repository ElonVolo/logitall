jest.autoMockOff();
const defineTest = require('evcodeshift/dist/testUtils').defineTest;

defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', '--fail-on-error' : true}, 'function-anonymous', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', 'params' : true, '--fail-on-error' : true }, 'function-anonymous-logparams', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', '--fail-on-error' : true}, 'function-arrow', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', 'params' : true, '--fail-on-error' : true }, 'function-arrow-logparams', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', '--fail-on-error' : true}, 'function-declaration', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', '--fail-on-error' : true}, 'function-declaration-export-default-function', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', 'params' : true, '--fail-on-error' : true }, 'function-declaration-logparams', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', 'params' : true, '--fail-on-error' : true }, 'function-declaration-logparams-destructure-objectpattern', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', 'params' : true, '--fail-on-error' : true }, 'function-declaration-logparams-destructure-objectpattern-default-values', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', 'params' : true, '--fail-on-error' : true }, 'function-declaration-logparams-destructure-objectpattern-rename-extracted-values', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', 'params' : true, '--fail-on-error' : true }, 'function-rest-parameter', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', '--fail-on-error' : true}, 'function-return', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', '--fail-on-error' : true}, 'function-return-nonbrace-if', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', '--fail-on-error' : true}, 'function-return-nonbrace-for', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', '--fail-on-error' : true}, 'function-return-nonbrace-for-in', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', '--fail-on-error' : true}, 'function-return-nonbrace-for-of', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', '--fail-on-error' : true}, 'method-constructor', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', 'params': true, '--fail-on-error' : true }, 'method-constructor-logparams', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', 'params': true, '--fail-on-error' : true}, 'method-constructor-logparams-access-modifier', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', 'params': true, '--fail-on-error' : true}, 'method-constructor-logparams-access-modifier-default-param', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', '--fail-on-error' : true}, 'method-instance', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', 'params' : true, '--fail-on-error' : true}, 'method-instance-logparams', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', '--fail-on-error' : true }, 'method-static', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', 'params' : true, '--fail-on-error' : true }, 'method-static-logparams', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', '--fail-on-error' : true }, 'statement-expression', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', '--fail-on-error' : true }, 'statement-expression-nonbrace-if', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', '--fail-on-error' : true }, 'statement-expression-nonbrace-for', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', '--fail-on-error' : true }, 'statement-expression-nonbrace-for-in', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', '--fail-on-error' : true }, 'statement-expression-nonbrace-for-of', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', '--fail-on-error' : true }, 'statement-expression-nonbrace-do-while', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', 'rxjs' : true, '--fail-on-error' : true }, 'rxjs-basic', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', 'rxjs' : true, '--fail-on-error' : true }, 'rxjs-basic-existing-tap-import', { 'parser': 'ts' });
defineTest(__dirname + '../', 'transform', {'relpath': '__testfixtures__', 'rxjs' : true, '--fail-on-error' : true } , 'rxjs-internal-tap-import', { 'parser': 'ts' });
