import { Path } from "../../interfaces/path";
import { TupleToUnion } from "../../interfaces/unions";
import { IOverrideMapper } from "./override-mapper.interface";

export class OverrideMapper implements IOverrideMapper {
  perform<G extends object,T extends Path<G>[], H>(fields: IOverrideMapper.Params<G,T,H>): IOverrideMapper.Result<T>[] {
    const { fields: selectedFields, data, subst } = fields;
    return data.map(item => {
      return this.selectProperties(item, selectedFields, subst)
    }
    );
  }
  /**
    * Helper function to select properties according to paths
    * @param obj - object to get the property using paths
    * @param paths - Array of Path<object> like string[]
    * @returns Returns the mapped object
    * 
  */
  private selectProperties<K, T extends Path<any>[], H>(obj: K, paths: T, subst:H): IOverrideMapper.merged<TupleToUnion<T>, H> {
    return paths.reduce((acc, path) => {
      const pathParts = path.split('.')
      let currentObj = acc;
      //if is run helper function to every item inside
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        //verify if it's an array
        //@ts-ignore
        if (Array.isArray(obj[part])) {
          const parts = [...pathParts]
          parts.splice(0, i + 1)
          //if is run helper function to every item inside
          //@ts-ignore
          currentObj[part] = obj[part].map(el => this.selectProperties(el, parts))
        } else {
          //set parent part of return object
          //@ts-ignore
          currentObj[part] = currentObj[part] || {};
          //@ts-ignore
          currentObj = currentObj[part];
        }
      }
      //get the last part of path and value
      const lastPart = pathParts[pathParts.length - 1];
      let value = subst

      //if the value is not undefined set him
      if (typeof value != undefined) {
        //@ts-ignore
        currentObj[lastPart] = value;
        //@ts-ignore
      }
      //if the value is a array run select for each item 
      if (Array.isArray(value)) {
        //@ts-ignore
        currentObj[lastPart] = value.map(el => selectProperties(el, [lastPart]))
      }
      return acc;
    }, {} as IOverrideMapper.merged<TupleToUnion<T>,H>);
  }
}



