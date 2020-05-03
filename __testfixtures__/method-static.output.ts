class TestStaticMethodClass {
    
    static calculateArea(radius:number) {
        console.log("[logitall]  __testfixtures__/method-static.input.ts:3:calculateArea()");
        console.log("[logitall]  __testfixtures__/method-static.input.ts:4");
        return this.pi * radius * radius;
    }
}
