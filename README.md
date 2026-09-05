# unbiased-round

Banker's rounding — round half to even — for JavaScript and TypeScript.

`Math.round()` sends every tie up. Over a column of numbers that bias adds up: round
200 halves with `Math.round()` and the total drifts 100 too high. Sending ties to the
nearest **even** neighbour instead cancels them out, which is why it's the IEEE 754
default and what accounting, tax and statistics work usually expects.

- ~40 lines, zero dependencies, no `BigInt`, no `Decimal`
- Correct on the floating-point traps: `round(1.005, 2)` sees the tie
- ESM + CJS + bundled types
- 100% of the API is one function you already know how to call

## Install

```sh
npm install unbiased-round
```

## Use

```js
import { round } from "unbiased-round";

round(0.5); // 0    (Math.round: 1)
round(1.5); // 2
round(2.5); // 2    (Math.round: 3)
round(3.5); // 4
round(-2.5); // -2  (Math.round: -2, by accident)

round(2.675, 2); // 2.68
round(1.005, 2); // 1
round(1250, -2); // 1200 — negative digits round left of the point
```

CommonJS works too:

```js
const { round } = require("unbiased-round");
```

## API

### `round(value, digits = 0)`

Rounds `value` to `digits` decimal places, breaking exact ties toward the even digit.
Also exported as `bankersRound` and `roundHalfEven`, and as the default export — pick
whichever name reads best.

`digits` may be negative to round to tens, hundreds and beyond. `NaN` and `±Infinity`
pass through untouched. A non-number `value` throws a `TypeError`; a `digits` that
isn't an integer within ±100 throws a `RangeError`.

### `createRounder(digits = 0)`

Returns a rounder bound to a number of decimal places — convenient for `map`, and it
validates `digits` once up front instead of on every call.

```js
import { createRounder } from "unbiased-round";

const toCents = createRounder(2);
[1.005, 2.675, 3.5].map(toCents); // [1, 2.68, 3.5]
```

### `toFixed(value, digits = 0)`

Rounds, then formats with exactly `digits` decimal places — `Number.prototype.toFixed`
with the tie-breaking fixed.

```js
import { toFixed } from "unbiased-round";

(1.015).toFixed(2); //  "1.01"  ← the built-in loses the tie
toFixed(1.015, 2); //   "1.02"
toFixed(7, 2); //       "7.00"
```

## About floating point

`1.005` isn't really `1.005` in binary — it's `1.00499999999999989…`, so
`1.005 * 100` gives `100.49999999999999` and the tie disappears before anything can
round it. This library shifts the decimal point through the number's own string form
instead of multiplying, so the value you wrote is the value that gets rounded.

That means `round()` works on the decimal you *meant*, which is what you want for
money and reported figures. If you need exactness beyond a `double` — more than 15
significant digits, or arbitrary-precision arithmetic — reach for a decimal library
instead; this one deliberately stays a couple of lines of arithmetic.

## License

MIT © LordRanchoatos
