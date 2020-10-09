import { tap } from "rxjs/operators";
import { of, pipe } from 'rxjs';
import { map, filter } from 'rxjs/operators';

let myStream$ = of(7).pipe(tap(x => {
    console.log(
        `[logitall]  Stage 0 value for rxjs pipe starting at line 4 in __testfixtures__/rxjs-basic.input.ts is:
${x}\n`
    );
}), map(x => x + 1), tap(x => {
    console.log(
        `[logitall]  Stage 1 value for rxjs pipe starting at line 4 in __testfixtures__/rxjs-basic.input.ts is:
${x}\n`
    );
}), filter(x => x > 2), tap(x => {
    console.log(
        `[logitall]  Final value for rxjs pipe starting at line 4 in __testfixtures__/rxjs-basic.input.ts is:
${x}\n`
    );
}), );