class BaseClass {
    
    public stuff:string;

    constructor() {
        console.log("[logitall]  __testfixtures__/method-constructor.input.ts:5:constructor()");
        console.log("[logitall]  __testfixtures__/method-constructor.input.ts:6");
        this.stuff = "things"
    }

    doStuff() {
        console.log("[logitall]  __testfixtures__/method-constructor.input.ts:9:doStuff()");
        let matter = this.stuff;
    }
}

class Subclass extends BaseClass {
    items:string[];

    constructor() {
        super();

        console.log(
            "[logitall]  __testfixtures__/method-constructor.input.ts:17:constructor()"
        );

        console.log("[logitall]  __testfixtures__/method-constructor.input.ts:19");
        this.items = ["ThingOne", "ThingTwo"];
    }
}


