import { EntityManager, EntityTarget } from 'typeorm'
import { IBaseEntity } from '../../entities/base-entity'

export interface IUpdateUseCase<T extends IBaseEntity, H = T> {
  perform: (data: IUpdateUseCase.Params<H>) => Promise<H extends IBaseEntity ? T : H>
}

export namespace IUpdateUseCase {
  export interface Params<T> {
    params: Partial<T> & { _id:string }
    tenantId: string
    userId: string
    manager?: EntityManager
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