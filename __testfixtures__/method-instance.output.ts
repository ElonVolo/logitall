class TestInstanceMethodClass {
    testlog(paramOne:number, paramTwo: number): number {
        console.log("[logitall]  __testfixtures__/method-instance.input.ts:2:testlog()");
        const total:number = paramOne + paramTwo;
        console.log("[logitall]  __testfixtures__/method-instance.input.ts:4");
        return total;
    }
}
