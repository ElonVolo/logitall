# logitall

### "logitall logs it all!"
logitall is a sort of "dumb tracing" utitlity goes through your entire codebase (or specified portion thereof) adding console.log() statements methods to specify when functions, and many kinds of statements are being executed. This provides real-time debugging info in the debugging console without having to use a debugging to step through code to see what's happening.

I created logitall becase I had to deal with way too many situations where sourcemapping/debugging breaks in a JavaScript/TypeScript project and using the debugger just isn't possible.

##Installation

npm install -g logitall

## Warning

It is highly recommended that you run logitall on a copied duplicate of whatever  project you're trying to debug. logitally will permanently add thousands of console.log statements to your project, and not everyone on your team will appreciate that in a code review.

## Usage

Run logitall from the command line and point it to the file/directory path of the code that needs console.log() statements added to it.

**logitall** _path_

For example, let's say you have a project called MyProject, and it contained a source directory named src. To instrument all the code in the src directory using logitall, you would run the command

```logitall MyProject/src```

If there was a typescript class named NumberAdder located in MyProject/src/NumberAdder.ts, running the above command would change the contents of the NumberAdder class from the following below:

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



