class TestInstanceMethodClass {
    testlog(paramOne:number, paramTwo: number): number {
        console.log(
            "[logitall]  __testfixtures__/method-instance-logparams.input.ts:2:testlog()"
        );

        console.log(
            `[logitall]  	__testfixtures__/method-instance-logparams.input.ts:2::param paramOne value: 
										${JSON.stringify(paramOne)}`
        );

        console.log(
            `[logitall]  	__testfixtures__/method-instance-logparams.input.ts:2::param paramTwo value: 
										${JSON.stringify(paramTwo)}`
        );

        const total:number = paramOne + paramTwo;
        console.log("[logitall]  __testfixtures__/method-instance-logparams.input.ts:4");
        return total;
    }
}