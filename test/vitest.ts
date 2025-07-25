import { expect } from "vitest";

expect.extend({
    toBeSorted(received: Iterable<number|bigint>, { reverse = false }: { reverse?: boolean } = {}) {
        const { isNot } = this;

        const arr = Array.from(received);
        if (reverse) arr.reverse();
        const pass = arr.every((v, i, a) => i === 0 || a[i - 1] <= v);

        return {
            pass,
            message: () => `expected ${received}${isNot ? " not" : ""} to be sorted${reverse ? " in reverse order" : ""}`,
        }
    },
    toBeSortedBy<T>(received: Iterable<T>, sortingKeyer: (value: T) => number|bigint, { reverse = false }: { reverse?: boolean } = {}) {
        const { isNot } = this;

        const arr = Array.from(received, value => sortingKeyer(value));
        if (reverse) arr.reverse();
        const pass = arr.every((v, i, a) => i === 0 || a[i - 1] <= v);

        return {
            pass,
            message: () => `expected ${received}${isNot ? " not" : ""} to be sorted${reverse ? " in reverse order" : ""} by the keyer function`,
        }
    },
    toBeSortedByMapValue(received: Map<any, number|bigint>, { reverse = false }: { reverse?: boolean } = {}) {
        const { isNot } = this;

        const arr = Array.from(received.values());
        if (reverse) arr.reverse();
        const pass = arr.every((v, i, a) => i === 0 || a[i - 1] <= v);

        return {
            pass,
            message: () => `expected ${received}${isNot ? " not" : ""} to be sorted${reverse ? " in reverse order" : ""} by its values`,
        }
    }
});
