import { IBaseEntity } from '@/domain/entities/base-entity'
import {Path} from '../../../../../../../interfaces/path'

export interface IGetUseCase<T extends IBaseEntity, G = T> {
  perform: (data: IGetUseCase.Params<G>) => Promise<IGetUseCase.Result<T>>
}

export namespace IGetUseCase {
  export interface Params<T> {
    since?: Date
    until?: Date
    page?: number
    notPage?: boolean
    size?: number
    params?: Array<FindOptions<T>> | FindOptions<T>
    select?: Path<T>[]
    relations?: FindOptionsRelations<T>
    order?: FindOptionsOrder<T>
  }

  export type Result<T> = [T[], number]
}


type FindOptions<T> = Partial<T> 

 type FindOptionsRelationsProperty<Property> = true |  FindOptionsRelations<Property>
/**
 * Relations find options.
 */
 type FindOptionsRelations<Entity> = {
    [P in keyof Entity]?: Entity[P] extends IBaseEntity ? FindOptionsRelationsProperty<Entity[P]>: Entity[P] extends Array<infer Item> ? Item extends IBaseEntity  ? FindOptionsRelationsProperty<Item> : never : never
};


 type FindOptionsOrderProperty<Property> = true |  FindOptionsOrder<Property>
/**
 * Relations find options.
 */
 type FindOptionsOrder<Entity> = {
    [P in keyof Entity]?: Entity[P] extends IBaseEntity ? FindOptionsOrderProperty<Entity[P]>: Entity[P] extends Array<infer Item> ? Item extends IBaseEntity  ? FindOptionsOrderProperty<Item> : never : never
};
