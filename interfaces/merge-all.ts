
/**
  * merge objects into one   
  * @example
  * ```ts
  *  type Foo = { a: 1; b: 2 }
  *  type Bar = { a: 2 }
  *  type Baz = { c: 3 }
  *  type Result = MergeAll<[Foo, Bar, Baz]>
  * ```
*/
export type MergeAll<XS, P = {}> = XS extends [infer F, ...infer Rest]
  ? MergeAll<Rest, Merge<P, F>>
  : P;

type Merge<F, S> = {
  [P in keyof F | keyof S]: P extends keyof S
  ? P extends keyof F
  ? Merge<S[P], F[P]>
  : S[P]
  : P extends keyof F
  ? F[P]
  : never;
};