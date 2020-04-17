# logitall

### "logitall logs it all!"
logitall is a sort of "dumb tracing" utitlity that goes through your entire codebase (or specified portion thereof) adding console.log() statements methods to specify when functions, and many kinds of statements are being executed. This approach provides real-time debugging info in the debugging console without having to use a debugger to step through code to see what's happening.

#### Why? Just. Please. Tell. Us. Why. 
I created logitall becase over a great many years I had to deal with way too many situations where sourcemapping/debugging breaks in a JavaScript/TypeScript project and using the debugger to step through code like a normal person just isn't an option.

## Installation

npm install -g logitall

## Warning

It is highly recommended that you run logitall on a copied duplicate of whatever  project you're trying to debug. logitally will permanently add thousands of console.log statements to your project, and not everyone on your team will appreciate that in a code review.

## Usage

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

#### How to intepret the results

In most cases logitall's console.log() statements will display the name of the file, possibly the name of the function that's been entered (if there is one), and the line at which it occurred. Many other kinds of statements, such as return's and anonymous functions, are also logged.

Note that the line numbers being printed to the console are actually the line numbers that existed _prior to logitall being run_!. For example, in the __NumberAdder.ts__ file modified by logitall in the earlier example, the following line appears on the 4th line of the NumberAdder.ts file, even though the original code it's referring to is on the 3rd line.

```console.log("[logitall]  NumberAdder.ts:3:addTwoNumbers()");```

To use logitall to its fullest extent, you should have an unmodified version of your project open in the IDE of your choice sitting next to whatever's printing out the console.log() statements (browser, etc). As you read through the list of logged lines in your browser, refer to the corresponding code in your original project.

#### Ignoring troublesome code

There might be certain source code files or directories that you do not wish to modify. This might be because those items really should not be logged because they are essentially configuration files (e.g. karma.conf.js). Or your reason for using the ignore feature could be one really huge source code file pushing 20 MB that contains thousands of constants declared in JS--and that would take forever for logitall to parse.


Whatever your reason for ignoring certain files and directories, the way to ignore them is to create a .gitignore-style file where each pattern/path for a file(s)/directory(ies) you want logitall to avoid is on its own line. Once you've created the ignore file, run the logitall command with the __--ignore-config__ flag and pass in the path to your ignore file.

As previously mentioned, a common example where you might use the --ignore-config option would be running logitall on the root level of a project directory that contains a node\_modules directory. As there might be thousands of modules in the node_modules directory, you probably do not want all of them instrumented with logitall and printing millions of console.log() statements. So you create a file named __my-projects-logitall-ignore__ with the following line in your ignore file:

```node_modules/```

If you then wanted to add a second file to ignore, let's say the karma.conf.js config file used to set up unit tests in jasmine, you'd add the name of that file and now you have the following two lines in your ignore file:

```
node_modules/
karma.conf.js
```

To run the logitall script with the newly added ignores, you would run the following command:

__logitall__ __---ignore-config__ __my-projects-logitall-ignore__
