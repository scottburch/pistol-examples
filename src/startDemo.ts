import {compileBrowserCode, startTestNetwork} from "@scottburch/pistol/lib/test/testUtils.js";
import {map, of, switchMap, tap} from "rxjs";

startTestNetwork([[1], []]).pipe(
    switchMap(() => compileBrowserCode('src/demo.html')),
    switchMap(() => displayInstructions())
).subscribe();

function displayInstructions() {
    return of([
        '\n\n',
        'PISTOL CHAT DEMO',
        'To run the demo enter the urls below into two browser windows:',
        'http://localhost:1234/?peer=0    (points this browser at running peer 0)',
        'http://localhost:1234/?peer=1    (points this browser at running peer 1)'
    ]).pipe(
        map(lines => lines.join('\n')),
        tap(console.log)
    )
}