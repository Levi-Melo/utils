import { ElasticSearchRepository } from ".";
import { elasticsearchOptions } from "./client-options";
import { NoSQLRepositoryInterface } from "./elastic-repository"

interface IBaseEntity{
    _id:string
}
class BaseEntity  implements IBaseEntity{
    readonly _id:string
    constructor(props: IBaseEntity) {
        Object.assign(this, props);
      }
}

interface IExample extends IBaseEntity {}

class Example extends BaseEntity implements IExample {}

export interface IExampleRepository extends NoSQLRepositoryInterface<Example> { }

export class ExampleRepository extends ElasticSearchRepository<Example> {
    constructor() {
      super({
        entity: Example,
        index: "report",
        options: elasticsearchOptions
      })
    }
  }