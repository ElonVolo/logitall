import { of, pipe } from 'rxjs';
import { map, tap, filter } from 'rxjs/internal/operators';

let myStream$ = of(7).pipe(
    map(x => x + 1), 
    filter(x => x > 2)
);