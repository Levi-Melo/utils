import { Path } from "../../interfaces/path"
interface BaseEntity{
  _id:string,
}
export interface NoSQLRepositoryInterface<Entity extends BaseEntity> {
    rebuildIndex(replaces:string[]):void
    deleteOne(input: NoSQLNamespace.DeleteOneInput<Entity>): Promise<NoSQLNamespace.DeleteResult<Entity>>
    deleteMany(input: NoSQLNamespace.DeleteManyInput<Entity>): Promise<NoSQLNamespace.DeleteResult<Entity>>
    mcount(input: NoSQLNamespace.MCountInput<Entity>): Promise<NoSQLNamespace.MCountResult>
    count(input: NoSQLNamespace.CountInput<Entity>): Promise<NoSQLNamespace.CountResult>
    createOne(input: NoSQLNamespace.CreateOneInput<Entity>): Promise<NoSQLNamespace.CreateResult<Entity>>
    createMany(input: NoSQLNamespace.CreateManyInput<Entity>): Promise<NoSQLNamespace.CreateResult<Entity>>
    updateOne(input: NoSQLNamespace.UpdateOneInput<Entity>): Promise<NoSQLNamespace.UpdateResult<Entity>>
    updateMany(input: NoSQLNamespace.UpdateManyInput<Entity>): Promise<NoSQLNamespace.UpdateResult<Entity>>
    findOne(input: NoSQLNamespace.FindOneInput<Entity>): Promise<NoSQLNamespace.FindOneResult<Entity>>
    findMany(input: NoSQLNamespace.FindManyInput<Entity>): Promise<NoSQLNamespace.FindManyResult<Entity>>
    findManyStream(input: NoSQLNamespace.FindManyStreamInput<Entity>, call: NoSQLNamespace.Call<Entity>): Promise<void>
  }
  export namespace NoSQLNamespace {
    type Nested<Entity> = {
    };
    export type Value<Entity> = {
      [P in keyof Entity]?:
      | Nested<Entity[P]>
      | (Entity[P] extends Array<infer U> ? Nested<U> | Nested<U>[] : never)
    }
  
    export type Query<Entity> = {
      [P in keyof Entity]?:
      | Nested<Entity[P]>
      | (Entity[P] extends Array<infer U> ? Nested<U> | Nested<U>[] : never)
      | {
        [props in Operators]?:
        | Nested<Entity[P]>[]
        | Nested<Entity[P]>
        | (Entity[P] extends Array<infer U> ? Nested<U> | Nested<U>[] : never)
      }
    };
  
    export type ArrayQuery<Entity> = {
      [P in keyof Entity]?:
      | Entity[P]
      | Partial<Entity[P]>
      | (Entity[P] extends Array<infer U> ? Nested<U> | Nested<U>[] : never)
    }
  
    export type ArrayValue<Entity> = {
      [P in keyof Entity]?:
      | Entity[P]
      | Partial<Entity[P]>
      | (Entity[P] extends Array<infer U> ? Nested<U> | Nested<U>[] : never)
    }
  
    export type CompoundQuery<Entity> = {
      must?: Query<Entity>[]
      must_not?: Query<Entity>[]
      should?: Query<Entity>[]
    } & Query<Entity>
  
    type Operators = 'in'
      | 'nin'
      | 'eq'
      | 'ne'
      | 'gt'
      | 'gte'
      | 'lt'
      | 'lte'
      | 'type'
      | 'exists'
      | 'size'
      | 'regex'
      | 'elemMatch'
  
    export type Pagination = {
      from: number
      size: number
    }
  
    export type Sort<Entity> = {
      [P in keyof Entity]?:
      | ('asc' | 'desc')
      | ({ [K in keyof Entity[P]]: 'asc' | 'desc' } extends infer O ? { [K in keyof O]?: O[K] } : never)
      | (Entity[P] extends Array<infer U> ? { [K in keyof U]?: 'asc' | 'desc' } : never)
    }
  
    export type Fields<Entity> = {
      [P in keyof Entity]?: 0 | 1
    }
  
    export type Lookup = {
      from: string,
      localField: string,
      foreignField: string,
      as: string
    }
  
    export type Metadata = {
      total: number
      rows: number
      size: number
      from: number
    }
  
    export interface Metric<Entity> {
      field: Path<Entity>
      operation: MetricOperation
      alias?: string
    }
  
    enum MetricOperation {
      Average = 'avg',
      Sum = 'sum',
      Min = 'min',
      Max = 'max',
      StdDevPop = 'stdDevPop',
      StdDevSamp = 'stdDevSamp'
    }
  
    export type GroupBy<Entity> = {
      field: Path<Entity>
      type?: "date" | "number" | "string" | "boolean"
    }
  
    export type FindOneResult<Entity> = { data: Entity, metadata: Metadata }
    export type FindManyResult<Entity> = { data: Entity[], metadata: Metadata }
  
    export type MFindManyResult<Entity> = { data: { name: string, data: Entity[] }[] }
  
    export type UpdateResult<Entity> = { before: Entity[], updated: Entity[] }
  
  
    export type CountResult = {
      counted: number
    }
    export type MCountResult = {
      counted: object
    }
  
    export type MathResult = { data: object }
  
    export type DeleteResult<Entity> = {
      deleted: Entity[]
    }
  
    export type CreateResult<Entity> = {
      created: Entity[]
    }
  
    export type TimelineResult = { data: any[] }
  
    export type Call<Entity> = {
      write: (input: Entity[]) => void
      end: () => void
    }
  
    export type DeleteManyInput<Entity> = {
      query: Query<Entity>
    }
  
    export type DeleteOneInput<Entity> = {
      query: Query<Entity>
    }
  
    export type TimelineInput<Entity> = {
      query: CompoundQuery<Entity>
    }
  
    export type MathInput<Entity> = {
      query: CompoundQuery<Entity>
      groupBy: GroupBy<Entity>[]
      metric: Metric<Entity>[]
    }
  
    export type MMathInput<Entity> = {
      operations: {
        alias: string
        query: CompoundQuery<Entity>
        groupBy: GroupBy<Entity>[]
        metric: Metric<Entity>[]
      }[]
    }
  
    export type MCountInput<Entity> = {
      operations: {
        name: string
        query: CompoundQuery<Entity>
      }[]
    }
  
    export type CountInput<Entity> = {
      query: CompoundQuery<Entity>
    }
  
    export type CreateOneInput<Entity> = {
      data: Entity
    }
  
    export type CreateManyInput<Entity> = {
      data: Entity[]
    }
  
    export type UpdateBulkInput<Entity> = {
      operations: UpdateManyInput<Entity>[]
    }
  
    export type UpdateArrayInput<Entity> = {
      docQuery: Query<Entity>
      arrayQuery: ArrayQuery<Entity>
      value: ArrayValue<Entity>
      field: keyof Entity
    }
  
    export type PushInput<Entity> = {
      query: Query<Entity>
      value: Value<Entity>
    }
  
    export type PullInput<Entity> = {
      query: Query<Entity>
      value: Value<Entity>
    }
  
    export type UpdateOneInput<Entity> = {
      query: Query<Entity>
      value: Value<Entity>
      replace?: boolean
    }
  
    export type UpdateManyInput<Entity> = {
      query: Query<Entity>
      value: Value<Entity>
      replace?: boolean
    }
  
    export type FindOneInput<Entity> = {
      query: CompoundQuery<Entity>
      fields?: Fields<Entity>
      lookup?: Lookup[]
    }
  
    export type FindManyInput<Entity> = {
      query: CompoundQuery<Entity>
      pagination?: Pagination
      sort?: Sort<Entity>
      fields?: Fields<Entity>
      lookup?: Lookup[]
    }
  
    export type MFindManyInput<Entity> = {
      operations: {
        name: string
        query: CompoundQuery<Entity>
        pagination?: Pagination
        sort?: Sort<Entity>
        fields?: Fields<Entity>
        lookup?: Lookup[]
      }
    }
  
    export type FindManyStreamInput<Entity> = {
      query: CompoundQuery<Entity>
      sort?: Sort<Entity>
      fields?: Fields<Entity>
    }
  }
  
  
  
  
  
  
  
