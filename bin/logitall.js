#!/usr/bin/env node

const path = require('path');
const child_process = require('child_process');
const commander = require('commander');
const chalk = require('chalk');

commander
    .arguments('<filepath>')
    .name('logitall')
    .usage('(filepath | dirpath)')
    .arguments('<filepath>')
    .parse(process.argv)

function make_red(txt) {
    return chalk.red(txt);
}

if (commander.args.length === 0) {
    console.log(chalk.red('No file or directory to transform specified. Exiting.\n'));
    commander.outputHelp(make_red);
    console.log('\n');
    process.exit(1);
}

let parentDir = require('path').resolve(__dirname, '..');
let jsc = path.join(parentDir, 'node_modules', 'jscodeshift', 'bin', 'jscodeshift.js');
let transformPath = path.join(parentDir, 'transform.js');
let args = [jsc, '-t', transformPath, '--extensions=ts', '--parser=ts', commander.args[0], '--verbose=2', `--relpath=${commander.args[2]}`];

const jscodeshift = child_process.spawn('node', args);

jscodeshift.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

jscodeshift.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});

jscodeshift.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
});
