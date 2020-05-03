jest.autoMockOff();
const defineTest = require('jscodeshift/dist/testUtils').defineTest;

defineTest(__dirname + "../", 'transform', {'relpath': '__testfixtures__'}, 'function-anonymous', { 'parser': 'ts' });
defineTest(__dirname + "../", 'transform', {'relpath': '__testfixtures__'}, 'function-arrow', { 'parser': 'ts' });
defineTest(__dirname + "../", 'transform', {'relpath': '__testfixtures__'}, 'function-declaration', { 'parser': 'ts' });
defineTest(__dirname + "../", 'transform', {'relpath': '__testfixtures__'}, 'function-return', { 'parser': 'ts' });
defineTest(__dirname + "../", 'transform', {'relpath': '__testfixtures__'}, 'method-constructor', { 'parser': 'ts' });
defineTest(__dirname + "../", 'transform', {'relpath': '__testfixtures__'}, 'method-instance', { 'parser': 'ts' });
defineTest(__dirname + "../", 'transform', {'relpath': '__testfixtures__'}, 'method-static', { 'parser': 'ts' });
defineTest(__dirname + "../", 'transform', {'relpath': '__testfixtures__'}, 'statement-expression', { 'parser': 'ts' });
