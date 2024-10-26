import { MergeAll } from "../../interfaces/merge-all";
import { Path } from "../../interfaces/path";
import { TupleToNestedObject } from "../../interfaces/tuple-to-nested";
import { TupleToUnion, UnionToTuple } from "../../interfaces/unions";

export interface IOverrideMapper {
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
  perform <G extends object,T extends Path<G>[], H>(fields: IOverrideMapper.Params<G,T,H>): IOverrideMapper.Result<T>[]
}

export namespace IOverrideMapper {
  /**
    * @param fields - Array of Path<object> like string[]
    * @example
    * ```ts
    *fields:['gps.latlng.latitude', 'gps.latlng.longitude', 'timestamp_event', 'identifier']
    * ```
    * @param data - Array of object that will be mapped
  */
  export type Params<G,T, H> = {
    fields: T;
    subst: H;
    data: G[]
  };

  // Novo tipo Result que mantém a estrutura original dos objetos
  export type Result<T extends Path<any>[], H = any> = merged<TupleToUnion<T>, H>
  /**
   * Helper to create result in object interface
  */
  export type merged<T extends string, H> = MergeAll<UnionToTuple<TupleToNestedObject<T, H>>>
}
