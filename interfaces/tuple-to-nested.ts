/**
  * Transform an tuple in a nested object TupleToNestedObject TupleToNestedObject<['A.b', 'C'], U> expected to be {A:{b:U}, C:U}
*/
export type TupleToNestedObject<T extends string, U = {}> = T extends `${infer Head}.${infer Tail}` ?
  { [K in Head]: TupleToNestedObject<Tail, U> } : { [K in T]: U }
