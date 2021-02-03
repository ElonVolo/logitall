class BaseClass {

    public items:number[];

    constructor(private paramOne:number, private paramTwo:number) {
        this.items = [paramOne, paramTwo];
    }

    mathOperation(): number {
        return this.items[0] + this.items[1];
    }
}

class Subclass extends BaseClass {

    constructor(private paramOne:number, private paramTwo:number) {
        super(paramOne, paramTwo);
    }

    mathOperation(): number {
        return this.items[0] * this.items[1];
    }
}
