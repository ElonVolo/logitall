class BaseClass {

    public items:number[];

    constructor(private paramOne:number, private paramTwo:number) {
        console.log(
            "[logitall]  __testfixtures__/method-constructor-logparams-access-modifier.input.ts:5:constructor()"
        );

        console.log(
            `[logitall]  	__testfixtures__/method-constructor-logparams-access-modifier.input.ts:5::param paramOne value: 
										${JSON.stringify(paramOne)}`
        );

        console.log(
            `[logitall]  	__testfixtures__/method-constructor-logparams-access-modifier.input.ts:5::param paramTwo value: 
										${JSON.stringify(paramTwo)}`
        );

        console.log(
            "[logitall]  __testfixtures__/method-constructor-logparams-access-modifier.input.ts:6"
        );

        this.items = [paramOne, paramTwo];
    }

    mathOperation(): number {
        console.log(
            "[logitall]  __testfixtures__/method-constructor-logparams-access-modifier.input.ts:9:mathOperation()"
        );

        console.log(
            "[logitall]  __testfixtures__/method-constructor-logparams-access-modifier.input.ts:10"
        );

        return this.items[0] + this.items[1];
    }
}

class Subclass extends BaseClass {

    constructor(private paramOne:number, private paramTwo:number) {
        super(paramOne, paramTwo);

        console.log(
            "[logitall]  __testfixtures__/method-constructor-logparams-access-modifier.input.ts:16:constructor()"
        );
    }

    mathOperation(): number {
        console.log(
            "[logitall]  __testfixtures__/method-constructor-logparams-access-modifier.input.ts:20:mathOperation()"
        );

        console.log(
            "[logitall]  __testfixtures__/method-constructor-logparams-access-modifier.input.ts:21"
        );

        return this.items[0] * this.items[1];
    }
}
