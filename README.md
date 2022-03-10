# logitall

![alt logitall_image](docs/images/logitall-example.png?raw=true "Title")

## "logitall logs it all!"
logitall is a "dumb trace" debugging tool that modifies all the code in a JavaScript file to print a message to the console before each line of code is run.

## Installation

npm install -g logitall


## Usage (CLI)

```
$ logitall --help

Usage: logitall [OPTION] logitall (FILE | DIR)

Options:
  --ignore-config <configfile>  a .gitignore-style list of file patterns to
                                ignore
  --gitignore                   shortcut that uses the .gitignore in the current directory to ignore files
  --named-functions-only        only log non-anonymous functions and methods
  --rxjs                        support for adding logging to rxjs pipe stages
  --params                      log values of function parameters
  -h, --help                    output usage information
```

## Tutorial

_Warning: Before using logitall, it is highly recommended that you run logitall on a copy of whatever  project you're trying to debug. logitall will permanently add thousands of console.log statements to your project, and not everyone on your team will appreciate that in a code review._

### First steps

Run logitall from the command line and point it to the file/directory path of the code that needs console.log() statements added to it.

**logitall** _path_

For example, let's say you have a project called MyProject, and it contained a source directory named src. To instrument all the source code files in the src directory and its descdendants using logitall, you would run the command

```logitall MyProject/src```

What would this command specifically do, code-wise? Let's say there is a Typescript class named NumberAdder located in MyProject/src/NumberAdder.ts. Running the above command would change the contents of the NumberAdder class from the following below:

```
class NumberAdder {

    addTwoNumbers(numOne: number, numTwo: number) {
        let newNumber = numOne + numTwo;
        return newNumber;
    }
}
```

to this:

```
class NumberAdder {

    addTwoNumbers(numOne: number, numTwo: number) {
        console.log("[logitall]  NumberAdder.ts:3:addTwoNumbers()");
        let newNumber = numOne + numTwo;
        console.log("[logitall]  NumberAdder.ts:5");
        return newNumber;
    }
}
```

When you run the code you should see in your debugging console/browser something like the following

```
> [logitall]  NumberAdder.ts:3:addTwoNumbers()
> [logitall]  NumberAdder.ts:5
```

#### Logging parameter values

If you pass the __--params__ flag to logitall, the values of each parameter will included with the logging of the function call. Use sparingly as this option will generate a ton of extra data you'll have to sort through later.

#### How to intepret the results

In most cases logitall's console.log() statements will display the name of the file, possibly the name of the function that's been entered (if there is one), and the line at which it occurred. Many other kinds of statements, such as return's and anonymous functions, are also logged.

Note that the line numbers being printed to the console are actually the line numbers that existed _prior to logitall being run_!. For example, in the __NumberAdder.ts__ file modified by logitall in the earlier example, the following line appears on the 4th line of the NumberAdder.ts file, even though the original code it's referring to is on the 3rd line.

```console.log("[logitall]  NumberAdder.ts:3:addTwoNumbers()");```

To use logitall to its fullest extent, you should have an unmodified version of your project open in the IDE of your choice sitting next to whatever's printing out the console.log() statements (browser, etc). As you read through the list of logged lines in your browser, refer to the corresponding code in your original project.

#### Ignoring files

Passing the `--gitignore` flag to logitall will force logitall to ignore any file patterns listed in the current directory's **.gitignore** configuration file.

For example, to add logging to all of your project's primary source code files and to avoid having logging added to any code in node_modules/, go to your project's root directory and run the following command:

```logitall --gitignore .```


For more customized ignores, you can create a .gitignore-style file where each pattern/path for a file(s)/directory(ies) you want logitall to avoid is on its own line. Once you've created the ignore file, run the logitall command with the __--ignore-config__ flag and pass in the path to your ignore file.


#### Minimalistic logging
Passing in the __--named-functions-only__ flag to logitall command limits logging to only cases where named functions and methods are called.

This feature can be useful when you need an uncluttered, 50,000 ft view of what basic functions/methods are being called in your program.

#### rxjs support

logitall now has experimental support for adding logging statements to rxjs. When the --rxjs flag is passed to logitall, logging statements are inserted before and after each stage of an rxjs pipeline.

For example, the following code:

```
import { of, pipe } from 'rxjs';
import { map, filter } from 'rxjs/operators';

let myStream$ = of(7).pipe(
    map(x => x + 1),
    filter(x => x > 2)
);
```

is transformed into
```
import { of, pipe } from 'rxjs';
import { map, tap, filter } from 'rxjs/operators';

let myStream$ = of(7).pipe(tap(x => {
    console.log(
        `[logitall]  Stage 0 value for rxjs pipe starting at line 4 in actual-rxjs-project/index.ts is:
${x}\n`
    );
}), map(x => x + 1), tap(x => {
    console.log(
        `[logitall]  Stage 1 value for rxjs pipe starting at line 4 in actual-rxjs-project/index.ts is:
${x}\n`
    );
}), filter(x => x > 2), tap(x => {
    console.log(
        `[logitall]  Final value for rxjs pipe starting at line 4 in actual-rxjs-project/index.ts is:
${x}\n`
    );
}), );
```

#### Undoing logitall

* The best, most safest way to use logitall is to make a complete duplicate of your project folder and run logitall on a copy of your code.
* If you are reasonably proficient with git, you could make sure all your changes prior to running logitall are stashed/committed, check out a branch, and then run logitall on the branch.
* You could also run logitall on your working branch (again with all changes stashed/committed), and then do a
* ```git checkout -- name_of_directory_you_ran_logitall_on``` to get rid of the changes logitall made.


#### Why? Just. Please. Tell. Us. Why.
I created logitall becase over a great many years I had to deal with way too many situations where sourcemapping/debugging breaks in a JavaScript/TypeScript project and using the debugger to step through code like a normal person just isn't an option.
