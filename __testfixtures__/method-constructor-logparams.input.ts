class BaseClass {
    
    public items:number[];

    constructor(paramOne:number, paramTwo:number) {
        this.items = [paramOne, paramTwo];
    }

    mathOperation(): number {
        return this.items[0] + this.items[1];
    }
}

class Subclass extends BaseClass {

    constructor(paramOne:number, paramTwo:number) {
        super(paramOne, paramTwo);
    }

    mathOperation(): number {
        return this.items[0] * this.items[1];
    }
}
