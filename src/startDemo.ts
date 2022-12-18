import {compileBrowserCode, startTestNetwork} from "@scottburch/pistol/lib/test/testUtils.js";
import {switchMap} from "rxjs";

startTestNetwork([[1], []]).pipe(
    switchMap(() => compileBrowserCode('src/demo.html'))
).subscribe()