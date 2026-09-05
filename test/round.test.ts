import { describe, expect, it } from "vitest";
import round, {
  bankersRound,
  createRounder,
  roundHalfEven,
  toFixed,
} from "../src/index";

describe("round", () => {
  it("sends exact halves to the nearest even integer", () => {
    expect(round(0.5)).toBe(0);
    expect(round(1.5)).toBe(2);
    expect(round(2.5)).toBe(2);
    expect(round(3.5)).toBe(4);
    expect(round(4.5)).toBe(4);
  });

  it("mirrors that on negative halves", () => {
    expect(round(-1.5)).toBe(-2);
    expect(round(-2.5)).toBe(-2);
    expect(round(-3.5)).toBe(-4);
  });

  it("rounds non-halves to the nearest value, as usual", () => {
    expect(round(2.4)).toBe(2);
    expect(round(2.6)).toBe(3);
    expect(round(-2.4)).toBe(-2);
    expect(round(-2.6)).toBe(-3);
    expect(round(1.4999999)).toBe(1);
    expect(round(1.5000001)).toBe(2);
  });

  it("differs from Math.round only on ties", () => {
    for (let i = -1000; i <= 1000; i++) {
      const value = i / 8; // Eighths: a mix of ties and non-ties, all exact.
      const isTie = Math.abs(value % 1) === 0.5;
      if (!isTie) expect(round(value)).toBe(Math.round(value));
      else expect(Math.abs(round(value) % 2)).toBe(0);
    }
  });

  it("rounds to a given number of decimal places", () => {
    expect(round(1.005, 2)).toBe(1);
    expect(round(1.015, 2)).toBe(1.02);
    expect(round(1.025, 2)).toBe(1.02);
    expect(round(2.675, 2)).toBe(2.68);
    expect(round(1.2345, 3)).toBe(1.234);
    expect(round(1.2355, 3)).toBe(1.236);
    expect(round(-1.005, 2)).toBe(-1);
    expect(round(-1.015, 2)).toBe(-1.02);
  });

  it("is not fooled by floating-point representation", () => {
    expect(round(0.1 + 0.2, 2)).toBe(0.3);
    expect(round(1.1 * 3, 2)).toBe(3.3);
    expect(round(35.855, 2)).toBe(35.86);
    expect(round(859.385, 2)).toBe(859.38);
  });

  it("returns exact decimals, not drifting doubles", () => {
    expect(round(2.345, 2)).toBe(2.34);
    expect(String(round(1.0049999, 2))).toBe("1");
    expect(String(round(8.345, 2))).toBe("8.34");
  });

  it("rounds left of the decimal point on negative digits", () => {
    expect(round(1250, -2)).toBe(1200);
    expect(round(1350, -2)).toBe(1400);
    expect(round(2500, -3)).toBe(2000);
    expect(round(3500, -3)).toBe(4000);
    expect(round(-2500, -3)).toBe(-2000);
    expect(round(1249, -2)).toBe(1200);
  });

  it("leaves integers alone when rounding to decimals", () => {
    expect(round(7)).toBe(7);
    expect(round(7, 4)).toBe(7);
    expect(round(-7, 2)).toBe(-7);
    expect(round(Number.MAX_SAFE_INTEGER, 2)).toBe(Number.MAX_SAFE_INTEGER);
  });

  it("passes non-finite values straight through", () => {
    expect(round(NaN)).toBeNaN();
    expect(round(Infinity)).toBe(Infinity);
    expect(round(-Infinity, 3)).toBe(-Infinity);
  });

  it("keeps the sign of zero", () => {
    expect(Object.is(round(0), 0)).toBe(true);
    expect(Object.is(round(-0), -0)).toBe(true);
    expect(Object.is(round(-0.4), -0)).toBe(true);
    expect(Object.is(round(-0.5), -0)).toBe(true);
    expect(Object.is(round(0.5), 0)).toBe(true);
  });

  it("handles very large and very small magnitudes", () => {
    expect(round(1e21, 2)).toBe(1e21);
    expect(round(1.5e-7, 7)).toBe(2e-7);
    expect(round(5e-324, 2)).toBe(0);
    expect(round(1.7976931348623157e308, 100)).toBe(1.7976931348623157e308);
  });

  it("defaults digits to 0", () => {
    expect(round(2.5, 0)).toBe(round(2.5));
  });

  it("rejects bad input", () => {
    // @ts-expect-error — runtime guard for JavaScript callers.
    expect(() => round("1.5")).toThrow(TypeError);
    // @ts-expect-error — runtime guard for JavaScript callers.
    expect(() => round(null)).toThrow(TypeError);
    expect(() => round(1.5, 1.5)).toThrow(RangeError);
    expect(() => round(1.5, NaN)).toThrow(RangeError);
    expect(() => round(1.5, 101)).toThrow(RangeError);
    expect(() => round(1.5, -101)).toThrow(RangeError);
  });

  it("does not bias the sum of a rounded dataset", () => {
    const halves = Array.from({ length: 200 }, (_, i) => i + 0.5);
    const exact = halves.reduce((a, b) => a + b, 0);
    const evens = halves.reduce((a, b) => a + round(b), 0);
    const ups = halves.reduce((a, b) => a + Math.round(b), 0);

    expect(evens).toBe(exact); // Ties split evenly, so nothing drifts.
    expect(ups - exact).toBe(0.5 * halves.length);
  });
});

describe("aliases", () => {
  it("expose the same function", () => {
    expect(bankersRound).toBe(round);
    expect(roundHalfEven).toBe(round);
    expect(bankersRound(2.5)).toBe(2);
  });
});

describe("createRounder", () => {
  it("binds a number of decimal places", () => {
    const toCents = createRounder(2);
    expect([1.005, 2.675, 3.5].map(toCents)).toEqual([1, 2.68, 3.5]);
  });

  it("defaults to whole numbers", () => {
    expect(createRounder()(2.5)).toBe(2);
  });

  it("validates digits eagerly", () => {
    expect(() => createRounder(0.5)).toThrow(RangeError);
  });
});

describe("toFixed", () => {
  it("pads to the requested number of decimals", () => {
    expect(toFixed(1.005, 2)).toBe("1.00");
    expect(toFixed(1.015, 2)).toBe("1.02");
    expect(toFixed(2.5)).toBe("2");
    expect(toFixed(3.5)).toBe("4");
    expect(toFixed(7, 2)).toBe("7.00");
    expect(toFixed(-1.015, 2)).toBe("-1.02");
  });

  it("fixes the ties that Number.prototype.toFixed gets wrong", () => {
    expect((1.015).toFixed(2)).toBe("1.01");
    expect(toFixed(1.015, 2)).toBe("1.02");
  });

  it("clamps negative digits to a whole number of places", () => {
    expect(toFixed(1250, -2)).toBe("1200");
  });

  it("stringifies non-finite values", () => {
    expect(toFixed(NaN, 2)).toBe("NaN");
    expect(toFixed(Infinity, 2)).toBe("Infinity");
  });
});
