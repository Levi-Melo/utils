import { EntityManager, EntityTarget } from 'typeorm'
import { IBaseEntity } from '../../entities/base-entity'

export interface IInsertUseCase<T extends IBaseEntity, H = T> {
  perform: (data: IInsertUseCase.Params<H>) => Promise<T>
}

export namespace IInsertUseCase {
  export interface Params<T> {
    params: Omit<T, '_id'>
    tenantId: string
    userId: string
    manager?: EntityManager
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