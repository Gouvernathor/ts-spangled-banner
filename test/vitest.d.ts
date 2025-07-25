import "vitest";

type ValueOfMap<M> = M extends Map<any, infer V> ? V : never;
type InnerOfIterable<I> = I extends Iterable<infer T> ? T : never;

interface CustomMatchers<R = unknown> {
    toBeSorted(options: {reverse?: boolean}): R;
    toBeSortedBy(sortingKeyer: (value: InnerOfIterable<R>) => number|bigint, options?: {reverse?: boolean}): R;
    toBeSortedByMapValue(options?: {reverse?: boolean}): R;
}

declare module "vitest" {
    interface Matchers<T = any> extends CustomMatchers<T> {}
}
