import { expect } from "vitest";

expect.extend({
    toBeSorted(received: Iterable<number|bigint>, { reverse = false }: { reverse?: boolean } = {}) {
        const arr = Array.from(received);
        if (reverse) arr.reverse();
        const indexFirstFail = arr.findIndex((v, i, a) => i > 0 && a[i - 1] > v);
        const pass = indexFirstFail === -1;
        const originalIndex = reverse ? arr.length - indexFirstFail - 1 : indexFirstFail;

        // string processing
        const message = pass ?
            `expected ${received} not to be sorted${reverse ? " in reverse order" : ""}` :
            `element ${arr[indexFirstFail]} at index ${originalIndex} is ${reverse ? "greater than" : "less than"} the previous element, ${arr[indexFirstFail - 1]}`;

        return {
            pass,
            message: () => message,
        }
    },
    toBeSortedBy<T>(received: Iterable<T>, sortingKeyer: (value: T) => number|bigint, { reverse = false }: { reverse?: boolean } = {}) {
        const arr = Array.from(received, value => sortingKeyer(value));
        if (reverse) arr.reverse();
        const indexFirstFail = arr.findIndex((v, i, a) => i > 0 && a[i - 1] > v);
        const pass = indexFirstFail === -1;
        const originalIndex = reverse ? arr.length - indexFirstFail - 1 : indexFirstFail;

        const message = pass ?
            `expected ${received} not to be sorted${reverse ? " in reverse order" : ""} by the keyer function` :
            `element ${arr[indexFirstFail]} at index ${originalIndex} is ${reverse ? "greater than" : "less than"} the previous element, ${arr[indexFirstFail - 1]}, when passed to the keyer function`;

        return {
            pass,
            message: () => message,
        }
    },
    toBeSortedByMapValue(received: Map<any, number|bigint>, { reverse = false }: { reverse?: boolean } = {}) {
        const arr = Array.from(received.values());
        if (reverse) arr.reverse();
        const indexFirstFail = arr.findIndex((v, i, a) => i > 0 && a[i - 1] > v);
        const pass = indexFirstFail === -1;
        const originalIndex = reverse ? arr.length - indexFirstFail - 1 : indexFirstFail;

        const message = pass ?
            () => `expected ${received} not to be sorted${reverse ? " in reverse order" : ""} by its values` :
            () => {
                const keys = Array.from(received.keys());
                const keyFirstFail = keys[originalIndex];
                const previousKey = keys[originalIndex - 1];
                return `element of key ${keyFirstFail} has value ${arr[indexFirstFail]}, ${reverse ? "greater" : "less"} than the value (${arr[indexFirstFail - 1]}) of the previous key, ${previousKey}`;
            };

        return {
            pass,
            message,
        }
    }
});
