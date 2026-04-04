export function tuple<T, L extends number>(length: L, map: (k: number) => T) {
    return Array.from({ length }, (_, k) => map(k)) as Tuple<T, L>;
}

type Tuple<
  T,
  N extends number,
  R extends T[] = [],
> = R['length'] extends N ? R : Tuple<T, N, [T, ...R]>;
