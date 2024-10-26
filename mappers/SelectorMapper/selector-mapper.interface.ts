import { MergeAll } from "../../interfaces/merge-all";
import { Path } from "../../interfaces/path";
import { TupleToNestedObject } from "../../interfaces/tuple-to-nested";
import { TupleToUnion, UnionToTuple } from "../../interfaces/unions";

export interface ISelectorMapper {
  /**
 * Function to map a array of objects using a array of fields.
 * @function perform
 * @returns Returns an array of mapped objects
 * @example 
 * ```ts
 * this.perform({
 * fields:['gps.latlng.latitude', 'gps.latlng.longitude', 'timestamp_event', 'identifier'],
 * data: object[]
 * })
 * ```
 * returns an array of
 * ```ts
 * {
 *  gps: {
 *     latlng: {
 *       latitude: any,
 *       longitude: any
 *     }
 *  },
 *  timestamp_event: any,
 *  identifier: any
 * }
 * ```
 */
  perform: <G extends object,T extends Path<G>[]>(fields: ISelectorMapper.Params<G,T>) => ISelectorMapper.Result<T>[]
}

export namespace ISelectorMapper {
  /**
    * @param fields - Array of Path<object> like string[]
    * @example
    * ```ts
    *fields:['gps.latlng.latitude', 'gps.latlng.longitude', 'timestamp_event', 'identifier']
    * ```
    * @param data - Array of object that will be mapped
  */
  export type Params<G,T> = {
    fields: T;
    data: G[]
  };

  // Novo tipo Result que mantém a estrutura original dos objetos
  export type Result<T extends Path<any>[]> = merged<TupleToUnion<T>>
  /**
   * Helper to create result in object interface
  */
  export type merged<T extends string> = MergeAll<UnionToTuple<TupleToNestedObject<T, any>>>
}
