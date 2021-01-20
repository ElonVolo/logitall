import { of, pipe } from 'rxjs';
import { map, tap, filter } from 'rxjs/internal/operators';

let myStream$ = of(7).pipe(tap(x => {
    console.log(
        `[logitall]  Stage 0 value for rxjs pipe starting at line 4 in __testfixtures__/rxjs-internal-tap-import.input.ts is:
${JSON.stringify(x)}\n`
    );
}), map(x => x + 1), tap(x => {
    console.log(
        `[logitall]  Stage 1 value for rxjs pipe starting at line 4 in __testfixtures__/rxjs-internal-tap-import.input.ts is:
${JSON.stringify(x)}\n`
    );
}), filter(x => x > 2), tap(x => {
    console.log(
        `[logitall]  Final value for rxjs pipe starting at line 4 in __testfixtures__/rxjs-internal-tap-import.input.ts is:
${JSON.stringify(x)}\n`
    );
}), );
