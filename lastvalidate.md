# Validation Output (2026-02-03T18:28:19.882Z)

```bash

> buymilk@1.0.0 build:only
> tsc -b && vite build

[36mvite v7.3.1 [32mbuilding client environment for production...[36m[39m
transforming...
[32m✓[39m 2453 modules transformed.
rendering chunks...
computing gzip size...
[2mdist/[22m[32mmanifest.webmanifest                        [39m[1m[2m    0.36 kB[22m[1m[22m
[2mdist/[22m[32mindex.html                                  [39m[1m[2m    0.53 kB[22m[1m[22m[2m │ gzip:   0.32 kB[22m
[2mdist/[22m[35massets/index-eq6ZCtX3.css                   [39m[1m[2m   42.49 kB[22m[1m[22m[2m │ gzip:   7.23 kB[22m
[2mdist/[22m[36massets/workbox-window.prod.es5-BIl4cyR9.js  [39m[1m[2m    5.76 kB[22m[1m[22m[2m │ gzip:   2.37 kB[22m
[2mdist/[22m[36massets/index-D3edBirF.js                    [39m[1m[2m1,224.07 kB[22m[1m[22m[2m │ gzip: 377.56 kB[22m
[32m✓ built in 10.79s[39m

PWA v1.2.0
mode      generateSW
precache  8 entries (1243.02 KiB)
files generated
  dist/sw.js
  dist/workbox-8c29f6e4.js

> buymilk@1.0.0 lint
> eslint .


> buymilk@1.0.0 check-any
> eslint . --config eslint.strict.config.ts


> buymilk@1.0.0 test
> vitest run --coverage


[1m[46m RUN [49m[22m [36mv4.0.18 [39m[90mC:/kod/buymilk[39m
      [2mCoverage enabled with [22m[33mv8[39m

[90mstderr[2m | src/hooks/useFirestoreSync.test.ts[2m > [22m[2museFirestoreSync[2m > [22m[2mshould handle snapshot errors
[22m[39mFirestore sync error for users/test-user-id/test-collection: Error: Firestore error
    at C:/kod/buymilk/src/hooks/useFirestoreSync.test.ts:89:27
    at [90mfile:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:145:11
    at [90mfile:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:915:26
    at [90mfile:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1243:20
    at new Promise (<anonymous>)
    at runWithTimeout [90m(file:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1209:10[90m)[39m
    at [90mfile:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:37
    at Traces.$ [90m(file:///C:/kod/buymilk/[39mnode_modules/[4mvitest[24m/dist/chunks/traces.CCmnQaNT.js:142:27[90m)[39m
    at trace [90m(file:///C:/kod/buymilk/[39mnode_modules/[4mvitest[24m/dist/chunks/test.B8ej_ZHS.js:239:21[90m)[39m
    at runTest [90m(file:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:12[90m)[39m

[90mstderr[2m | src/hooks/useFirestoreSync.test.ts[2m > [22m[2museFirestoreSync[2m > [22m[2mshould add item successfully
[22m[39mFirestore sync error for users/test-user-id/test-collection: Error: Firestore error
    at C:/kod/buymilk/src/hooks/useFirestoreSync.test.ts:89:27
    at [90mfile:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:145:11
    at [90mfile:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:915:26
    at [90mfile:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1243:20
    at new Promise (<anonymous>)
    at runWithTimeout [90m(file:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1209:10[90m)[39m
    at [90mfile:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:37
    at Traces.$ [90m(file:///C:/kod/buymilk/[39mnode_modules/[4mvitest[24m/dist/chunks/traces.CCmnQaNT.js:142:27[90m)[39m
    at trace [90m(file:///C:/kod/buymilk/[39mnode_modules/[4mvitest[24m/dist/chunks/test.B8ej_ZHS.js:239:21[90m)[39m
    at runTest [90m(file:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:12[90m)[39m

[90mstderr[2m | src/hooks/useFirestoreSync.test.ts[2m > [22m[2museFirestoreSync[2m > [22m[2mshould update item successfully
[22m[39mFirestore sync error for users/test-user-id/test-collection: Error: Firestore error
    at C:/kod/buymilk/src/hooks/useFirestoreSync.test.ts:89:27
    at [90mfile:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:145:11
    at [90mfile:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:915:26
    at [90mfile:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1243:20
    at new Promise (<anonymous>)
    at runWithTimeout [90m(file:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1209:10[90m)[39m
    at [90mfile:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:37
    at Traces.$ [90m(file:///C:/kod/buymilk/[39mnode_modules/[4mvitest[24m/dist/chunks/traces.CCmnQaNT.js:142:27[90m)[39m
    at trace [90m(file:///C:/kod/buymilk/[39mnode_modules/[4mvitest[24m/dist/chunks/test.B8ej_ZHS.js:239:21[90m)[39m
    at runTest [90m(file:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:12[90m)[39m

[90mstderr[2m | src/hooks/useFirestoreSync.test.ts[2m > [22m[2museFirestoreSync[2m > [22m[2mshould delete item successfully
[22m[39mFirestore sync error for users/test-user-id/test-collection: Error: Firestore error
    at C:/kod/buymilk/src/hooks/useFirestoreSync.test.ts:89:27
    at [90mfile:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:145:11
    at [90mfile:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:915:26
    at [90mfile:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1243:20
    at new Promise (<anonymous>)
    at runWithTimeout [90m(file:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1209:10[90m)[39m
    at [90mfile:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:37
    at Traces.$ [90m(file:///C:/kod/buymilk/[39mnode_modules/[4mvitest[24m/dist/chunks/traces.CCmnQaNT.js:142:27[90m)[39m
    at trace [90m(file:///C:/kod/buymilk/[39mnode_modules/[4mvitest[24m/dist/chunks/test.B8ej_ZHS.js:239:21[90m)[39m
    at runTest [90m(file:///C:/kod/buymilk/[39mnode_modules/[4m@vitest/runner[24m/dist/index.js:1653:12[90m)[39m

[90mstderr[2m | src/context/ToastContext.test.tsx[2m > [22m[2mToastContext[2m > [22m[2mshowToast adds a toast
[22m[39mAn update to ToastProvider inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act

[90mstderr[2m | src/context/ToastContext.test.tsx[2m > [22m[2mToastContext[2m > [22m[2mremoveToast removes a toast by id
[22m[39mAn update to ToastProvider inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act

 [32m✓[39m src/context/AuthContext.test.tsx [2m([22m[2m4 tests[22m[2m)[22m[32m 71[2mms[22m[39m
 [32m✓[39m src/hooks/useFirestoreSync.test.ts [2m([22m[2m10 tests[22m[2m)[22m[32m 106[2mms[22m[39m
 [32m✓[39m src/context/ToastContext.test.tsx [2m([22m[2m3 tests[22m[2m)[22m[32m 64[2mms[22m[39m
[90mstderr[2m | src/components/ListDetail.test.tsx[2m > [22m[2mListDetail[2m > [22m[2madds a new item
[22m[39mAn update to ListDetail2 inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act

 [32m✓[39m src/components/Modal.test.tsx [2m([22m[2m6 tests[22m[2m)[22m[32m 218[2mms[22m[39m
 [32m✓[39m src/components/SearchResults.test.tsx [2m([22m[2m5 tests[22m[2m)[22m[32m 108[2mms[22m[39m
[90mstderr[2m | src/components/ListDetail.test.tsx[2m > [22m[2mListDetail[2m > [22m[2mtoggles item completion
[22m[39mAn update to ListDetail2 inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act

 [32m✓[39m src/context/AppContext.test.tsx [2m([22m[2m5 tests[22m[2m)[22m[32m 107[2mms[22m[39m
 [32m✓[39m src/components/ListDetail.test.tsx [2m([22m[2m4 tests[22m[2m)[22m[32m 179[2mms[22m[39m

[2m Test Files [22m [1m[32m7 passed[39m[22m[90m (7)[39m
[2m      Tests [22m [1m[32m37 passed[39m[22m[90m (37)[39m
[2m   Start at [22m 19:28:42
[2m   Duration [22m 2.90s[2m (transform 836ms, setup 1.85s, import 2.71s, tests 853ms, environment 9.83s)[22m

JUNIT report written to C:/kod/buymilk/dist/test-results.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   54.34 |    40.24 |   44.69 |   56.02 |                   
 src               |     100 |      100 |     100 |     100 |                   
  firebase.ts      |     100 |      100 |     100 |     100 |                   
 src/components    |   45.64 |    39.31 |    37.6 |   47.56 |                   
  ...rBoundary.tsx |   31.25 |    16.66 |   42.85 |   31.25 | 22-30,35-40,48-80 
  ListDetail.tsx   |   40.86 |    32.58 |   28.26 |   43.24 | ...4-742,759-1011 
  Modal.tsx        |    91.3 |    88.23 |   85.71 |   90.47 | 35-36             
  ...chResults.tsx |   88.23 |    93.33 |   81.81 |    87.5 | 33,52             
 src/context       |   61.72 |     36.2 |   50.94 |   63.51 |                   
  AppContext.tsx   |   52.54 |    32.69 |   31.57 |   55.55 | ...41-248,256,328 
  AuthContext.tsx  |      80 |       75 |     100 |   79.16 | 38-39,47-48,62    
  ToastContext.tsx |   94.73 |       50 |     100 |   93.75 | 49                
 src/hooks         |     100 |      100 |     100 |     100 |                   
  ...estoreSync.ts |     100 |      100 |     100 |     100 |                   
-------------------|---------|----------|---------|---------|-------------------

```
