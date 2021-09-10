// @ts-ignore
function decycle(u){var f=[],c=[];return function p(o,i){var t,e,n,r=o&&o.toJSON instanceof Function?o.toJSON():o;if(typeof r=="object"&&r!==null){for(t=0;t<f.length;t+=1)if(f[t]===r)return{$ref:c[t]};if(f.push(r),c.push(i),Object.prototype.toString.apply(r)==="[object Array]")for(n=[],t=0;t<r.length;t+=1)n[t]=p(r[t],i+"["+t+"]");else{n={};for(e in r)Object.prototype.hasOwnProperty.call(r,e)&&(n[e]=p(r[e],i+"["+JSON.stringify(e)+"]"))}return n}return r}(u,"$")}

class BaseClass {

    public items:number[];

    constructor(paramOne:number, paramTwo:number) {
        console.log(
            '[logitall]  __testfixtures__/method-constructor-logparams.input.ts:5:constructor()'
        );

        console.log(
            `[logitall]  	__testfixtures__/method-constructor-logparams.input.ts:5::param paramOne value: 
										${JSON.stringify(decycle(paramOne))}`
        );

        console.log(
            `[logitall]  	__testfixtures__/method-constructor-logparams.input.ts:5::param paramTwo value: 
										${JSON.stringify(decycle(paramTwo))}`
        );

        console.log('[logitall]  __testfixtures__/method-constructor-logparams.input.ts:6');
        this.items = [paramOne, paramTwo];
    }

    mathOperation(): number {
        console.log(
            '[logitall]  __testfixtures__/method-constructor-logparams.input.ts:9:mathOperation()'
        );

        console.log('[logitall]  __testfixtures__/method-constructor-logparams.input.ts:10');
        return this.items[0] + this.items[1];
    }
}

class Subclass extends BaseClass {

    constructor(paramOne:number, paramTwo:number) {
        super(paramOne, paramTwo);

        console.log(
            '[logitall]  __testfixtures__/method-constructor-logparams.input.ts:16:constructor()'
        );
    }

    mathOperation(): number {
        console.log(
            '[logitall]  __testfixtures__/method-constructor-logparams.input.ts:20:mathOperation()'
        );

        console.log('[logitall]  __testfixtures__/method-constructor-logparams.input.ts:21');
        return this.items[0] * this.items[1];
    }
}
