class TestInstanceMethodClass {
    testlog(paramOne:number, paramTwo: number): number {
        console.log("[logitall]  __testfixtures__/method-instance.output.ts:2:testlog()");
        console.log("[logitall]  __testfixtures__/method-instance.output.ts:3");
        console.log("[logitall]  __testfixtures__/method-instance.input.ts:2:testlog()");
        const total:number = paramOne + paramTwo;
        console.log("[logitall]  __testfixtures__/method-instance.output.ts:5");
        console.log("[logitall]  __testfixtures__/method-instance.input.ts:4");
        console.log("[logitall]  __testfixtures__/method-instance.output.ts:6");
        return total;
    }
}