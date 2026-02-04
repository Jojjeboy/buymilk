# Validation Output (2026-02-04T12:58:25.963Z)

```bash

> buymilk@1.0.0 build:only
> tsc -b && vite build

[36mvite v7.3.1 [32mbuilding client environment for production...[36m[39m
transforming...
[32m✓[39m 2455 modules transformed.
rendering chunks...
computing gzip size...
[2mdist/[22m[32mmanifest.webmanifest                        [39m[1m[2m    0.45 kB[22m[1m[22m
[2mdist/[22m[32mindex.html                                  [39m[1m[2m    0.60 kB[22m[1m[22m[2m │ gzip:   0.34 kB[22m
[2mdist/[22m[35massets/index-BJjVFz7Q.css                   [39m[1m[2m   48.84 kB[22m[1m[22m[2m │ gzip:   8.17 kB[22m
[2mdist/[22m[36massets/workbox-window.prod.es5-BIl4cyR9.js  [39m[1m[2m    5.76 kB[22m[1m[22m[2m │ gzip:   2.37 kB[22m
[2mdist/[22m[36massets/index-BWzD7bj-.js                    [39m[1m[2m1,279.26 kB[22m[1m[22m[2m │ gzip: 391.80 kB[22m
[32m✓ built in 10.31s[39m

PWA v1.2.0
mode      generateSW
precache  9 entries (1303.19 KiB)
files generated
  dist/sw.js
  dist/workbox-8c29f6e4.js

> buymilk@1.0.0 lint
> eslint .


> buymilk@1.0.0 check-any
> eslint . --config eslint.strict.config.ts

