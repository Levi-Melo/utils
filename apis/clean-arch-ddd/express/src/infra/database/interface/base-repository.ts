import { EntityTarget } from "typeorm";
import { IBaseEntity } from "@/domain/entities/base-entity";
import { Path } from "../../../../../../../interfaces/path";

export interface IBaseRepository<T extends IBaseEntity, H = T>{
    get:( data : IBaseRepository.Get.Params<T>) => Promise<IBaseRepository.Get.Result<T>>
    getOne:( data : IBaseRepository.GetOne.Params<T>) => Promise<IBaseRepository.GetOne.Result<T>>
    insert: (data : IBaseRepository.Insert.Params<H>)=> Promise<H extends IBaseEntity ? T : H>
    update: (data : IBaseRepository.Update.Params<H>)=> Promise<H extends IBaseEntity ? T : H> 
    delete: (data: IBaseRepository.DeleteActivate.Params) => Promise<IBaseRepository.DeleteActivate.Result>
    activate: (data: IBaseRepository.DeleteActivate.Params) => Promise<IBaseRepository.DeleteActivate.Result>
}

export namespace IBaseRepository{
    export namespace Save {
        export type Params<H> =  IBaseRepository.Insert.Params<H> | IBaseRepository.Update.Params<H>
    }

    export namespace Insert {
        export interface Params<T> {
            params: Omit<T, '_id'>
            tenantId: string
            userId: string
            /** This defines the order of the insert on the database, example of usage:
            ```js
            order: {
                0: {
                    prop: 'name',
                    fk: [
                    {
                        locationOfProp: 'email',
                        prop: 'userId',
                    },
                    ],
                },
                1: {
                    prop: 'test',
                    fk: [
                    {
                        locationOfProp: 'test',
                        prop: 'testId',
                    },
                    ],
                },
                },
            ```
            */
            order?:
            Record<number, {
                
            prop: keyof Omit<T, '_id'>
            entity: EntityTarget<IBaseEntity>
            fk?: Array<{
                locationOfProp: keyof Omit<T, '_id'>
                prop: string
            }> }>
        }
        
        export type Result<T> = T
    }
    
    export namespace Update {
        export interface Params<T> {
            params: Partial<T> & { _id:string }
            tenantId: string
            userId: string
            /** This defines the order of the update on the database, example of usage:
            ```js
            order: {
                0: {
                    prop: 'name',
                    fk: [
                    {
                        locationOfProp: 'email',
                        prop: 'userId',
                    },
                    ],
                },
                1: {
                    prop: 'test',
                    fk: [
                    {
                        locationOfProp: 'test',
                        prop: 'testId',
                    },
                    ],
                },
                },
            ```
            */
            order?:
            Record<number, {
            prop: keyof T
            entity: EntityTarget<IBaseEntity>
            fk?: Array<{
                locationOfProp: keyof T
                prop: string
            }> }>
        }
        
        export type Result<T> = T
    }

    export namespace DeleteActivate {
        export interface Params { _id: string }
        
        export type Result = void
    }

    export namespace Get {
        export interface Params<T> {
          since?: Date
          until?: Date
          page?: number
          notPage?: boolean
          size?: number
          params?: Array<FindOptions<T>> | FindOptions<T>
          select: Path<T>[]
          relations?: FindOptionsRelations<T>
          order?: FindOptionsOrder<T>
        }
      
        export type Result<T> = [T[], number]
    }

    export namespace GetOne {
        export interface Params<T> {
          where?: Array<FindOptions<T>> | FindOptions<T>
          relations?: FindOptionsRelations<T>
        }
      
        export type Result<T> = T | null
    }
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

