class BaseClass {
    
    public stuff:string;

    constructor() {
        this.stuff = "things"
    }

    doStuff() {
        let matter = this.stuff;
    }
}

class Subclass extends BaseClass {
    items:string[];

    constructor() {
        super();
        this.items = ["ThingOne", "ThingTwo"];
    }
}

