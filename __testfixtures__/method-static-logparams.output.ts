// @ts-ignore
function decycle(u){var f=[],c=[];return function p(o,i){var t,e,n,r=o&&o.toJSON instanceof Function?o.toJSON():o;if(typeof r=="object"&&r!==null){for(t=0;t<f.length;t+=1)if(f[t]===r)return{$ref:c[t]};if(f.push(r),c.push(i),Object.prototype.toString.apply(r)==="[object Array]")for(n=[],t=0;t<r.length;t+=1)n[t]=p(r[t],i+"["+t+"]");else{n={};for(e in r)Object.prototype.hasOwnProperty.call(r,e)&&(n[e]=p(r[e],i+"["+JSON.stringify(e)+"]"))}return n}return r}(u,"$")}

class TestStaticMethodClass {
        
    public static readonly PI = 3.14;
    static calculateArea(radius:number) {
        console.log(
            '[logitall]  __testfixtures__/method-static-logparams.input.ts:4:calculateArea()'
        );

        console.log(
            `[logitall]  	__testfixtures__/method-static-logparams.input.ts:4::param radius value: 
										${JSON.stringify(decycle(radius))}`
        );

        console.log('[logitall]  __testfixtures__/method-static-logparams.input.ts:5');
        return this.PI * radius * radius;
    }
}