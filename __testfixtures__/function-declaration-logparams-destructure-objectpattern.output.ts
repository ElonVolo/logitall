// @ts-ignore
function decycle(u){var f=[],c=[];return function p(o,i){var t,e,n,r=o&&o.toJSON instanceof Function?o.toJSON():o;if(typeof r=="object"&&r!==null){for(t=0;t<f.length;t+=1)if(f[t]===r)return{$ref:c[t]};if(f.push(r),c.push(i),Object.prototype.toString.apply(r)==="[object Array]")for(n=[],t=0;t<r.length;t+=1)n[t]=p(r[t],i+"["+t+"]");else{n={};for(e in r)Object.prototype.hasOwnProperty.call(r,e)&&(n[e]=p(r[e],i+"["+JSON.stringify(e)+"]"))}return n}return r}(u,"$")}

// Basic object pattern
function aardvark({name, age}) {
  console.log(
    '[logitall]  __testfixtures__/function-declaration-logparams-destructure-objectpattern.input.ts:2:aardvark({name, age})'
  );

  console.log(
    `[logitall]  	__testfixtures__/function-declaration-logparams-destructure-objectpattern.input.ts:2:aardvark:param name value: 
                    ${JSON.stringify(decycle(name))}`
  );

  console.log(
    `[logitall]  	__testfixtures__/function-declaration-logparams-destructure-objectpattern.input.ts:2:aardvark:param age value: 
                    ${JSON.stringify(decycle(age))}`
  );
}
