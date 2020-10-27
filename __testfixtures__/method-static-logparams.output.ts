class TestStaticMethodClass {
        
    public static readonly PI = 3.14;
    static calculateArea(radius:number) {
        console.log(
            "[logitall]  __testfixtures__/method-static-logparams.input.ts:4:calculateArea()"
        );

        console.log(
            `[logitall]  	__testfixtures__/method-static-logparams.input.ts:4::param radius value: 
										${JSON.stringify(radius)}`
        );

        console.log("[logitall]  __testfixtures__/method-static-logparams.input.ts:5");
        return this.PI * radius * radius;
    }
}

