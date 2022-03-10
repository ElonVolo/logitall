#!/usr/bin/env node

const path = require('path');
const child_process = require('child_process');
const commander = require('commander');
const chalk = require('chalk');

commander
  .name('logitall')
  .usage('(filepath | dirpath)')
  .option('--ignore-config <configfile>', 'a .gitignore-style list of file patterns to ignore')
  .option('--gitignore', 'shortcut that uses the .gitignore in the current directory to ignore files')
  .option('--named-functions-only', 'only log non-anonymous functions and methods')
  .option('--rxjs', 'support for adding logging to rxjs pipe stages')
  .option('--params', 'log values of function parameters')
  .arguments('<filepath>')
  .parse(process.argv);

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
let jsc = path.join(parentDir, 'node_modules', 'evcodeshift', 'bin', 'jscodeshift.js');
let transformPath = path.join(parentDir, 'transform.js');
let args = [jsc, '-t', transformPath, '--extensions=ts,js', '--parser=ts', commander.args[0], '--verbose=2'];

let passedOptions = commander.opts();

if (passedOptions.ignoreConfig) {
  args.push(`--ignore-config=${passedOptions.ignoreConfig}`);
}

if (passedOptions.gitignore) {
  args.push('--gitignore');
}

if (passedOptions.namedFunctionsOnly) {
  args.push('--named-functions-only');
}

if (passedOptions.rxjs) {
  args.push('--rxjs');
}

if (passedOptions.params) {
  args.push('--params');
}

args.push(`--relpath=${commander.args[2]}`);

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
