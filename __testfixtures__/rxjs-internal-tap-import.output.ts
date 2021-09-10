// @ts-ignore
function decycle(u){var f=[],c=[];return function p(o,i){var t,e,n,r=o&&o.toJSON instanceof Function?o.toJSON():o;if(typeof r=="object"&&r!==null){for(t=0;t<f.length;t+=1)if(f[t]===r)return{$ref:c[t]};if(f.push(r),c.push(i),Object.prototype.toString.apply(r)==="[object Array]")for(n=[],t=0;t<r.length;t+=1)n[t]=p(r[t],i+"["+t+"]");else{n={};for(e in r)Object.prototype.hasOwnProperty.call(r,e)&&(n[e]=p(r[e],i+"["+JSON.stringify(e)+"]"))}return n}return r}(u,"$")}

import { of, pipe } from 'rxjs';
import { map, tap, filter } from 'rxjs/internal/operators';

let myStream$ = of(7).pipe(tap(x => {
    console.log(
        `[logitall]  Stage 0 value for rxjs pipe starting at line 4 in __testfixtures__/rxjs-internal-tap-import.input.ts is:
${JSON.stringify(decycle(x))}\n`
    );
}), map(x => x + 1), tap(x => {
    console.log(
        `[logitall]  Stage 1 value for rxjs pipe starting at line 4 in __testfixtures__/rxjs-internal-tap-import.input.ts is:
${JSON.stringify(decycle(x))}\n`
    );
}), filter(x => x > 2), tap(x => {
    console.log(
        `[logitall]  Final value for rxjs pipe starting at line 4 in __testfixtures__/rxjs-internal-tap-import.input.ts is:
${JSON.stringify(decycle(x))}\n`
    );
}), ).subscribe(x => {
    console.log(
        '[logitall]  __testfixtures__/rxjs-internal-tap-import.input.ts:7:(x) => {}'
    );

    console.log('[logitall]  __testfixtures__/rxjs-internal-tap-import.input.ts:8');
    console.log('Do thing X');
})