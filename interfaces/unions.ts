/**
  * Transform an union in intersection UnionToIntersection<{test:string} | {teste:string}> expected to be {test:string} & {teste:string}
*/
export type UnionToIntersection<U> = (
  U extends unknown ? (arg: U) => 0 : never
) extends (arg: infer I) => 0
  ? I
  : never;

/**
 * LastInUnion<1 | 2> = 2.
 */
export type LastInUnion<U> = UnionToIntersection<
  U extends unknown ? (x: U) => 0 : never
> extends (x: infer L) => 0
  ? L
  : never;

/**
 * UnionToTuple<1 | 2> = [1, 2].
 */
export type UnionToTuple<U, Last = LastInUnion<U>> = [U] extends [never]
  ? []
  : [...UnionToTuple<Exclude<U, Last>>, Last];

export type TupleToUnion<T extends readonly any[]> = T[number];
