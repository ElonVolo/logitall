import { of, pipe } from 'rxjs';
import { map, tap, filter } from 'rxjs/operators';

let myStream$ = of(7).pipe(
    map(x => x + 1), 
    filter(x => x > 2)
).subscribe(x => {
    console.log('Do thing X');
})