import { IBaseEntity } from '@/domain/entities/base-entity'

export interface IGetOneUseCase<T extends IBaseEntity, G = T> {
  perform: (data: IGetOneUseCase.Params<G>) => Promise<IGetOneUseCase.Result<T>>
}

export namespace IGetOneUseCase {
  export interface Params<T> {
    where?: Array<FindOptions<T>> | FindOptions<T>
    relations?: FindOptionsRelations<T>
    tenantId: string
    userId: string
  }

  export type Result<T> = T | null
}

type FindOptions<T> = Partial<T> 

type FindOptionsRelationsProperty<Property> = true |  FindOptionsRelations<Property>
/**
 * Relations find options.
 */
type FindOptionsRelations<Entity> = {
    [P in keyof Entity]?: Entity[P] extends IBaseEntity ? FindOptionsRelationsProperty<Entity[P]>: Entity[P] extends Array<infer Item> ? Item extends IBaseEntity  ? FindOptionsRelationsProperty<Item> : never : never
};

