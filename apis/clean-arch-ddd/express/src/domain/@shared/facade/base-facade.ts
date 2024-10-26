import { IBaseEntity } from "@/domain/entities/base-entity"
import { IGetUseCase, IGetOneUseCase, IInsertUseCase, IUpdateUseCase, IDeleteUseCase, IActivateUseCase } from "@/domain/@shared/usecases"

export interface IFacade<T extends IBaseEntity, G extends T = T , H extends T = T>{
    getOne: (data: IFacade.GetOne.Params<G>) => Promise<IFacade.GetOne.Result<T>>
    get: (data: IFacade.Get.Params<G>) => Promise<IFacade.Get.Result<T>>
    register: (data: IFacade.Register.Params<H>) => Promise<IFacade.Register.Result<T>>
    update: (data: IFacade.Update.Params<H>) => Promise<IFacade.Update.Result<T>>
    delete: (data: IFacade.Delete.Params) => Promise<IFacade.Delete.Result>
    activate: (data: IFacade.Activate.Params) => Promise<IFacade.Activate.Result>
}

export namespace IFacade {
    export interface Constructor<T extends IBaseEntity, G extends T = T , H extends T = T>{
      getOneUseCase: IGetOneUseCase<T,G>
      getUseCase: IGetUseCase<T,G>
      insertUseCase: IInsertUseCase<T,H>
      updateUseCase: IUpdateUseCase<T,H>
      deleteUseCase: IDeleteUseCase
      activateUseCase: IActivateUseCase
    }
    export namespace GetOne {
      export type Params<T extends IBaseEntity> = IGetOneUseCase.Params<T>
  
      export interface Result<T> { item: T }
    }
  
    export namespace Get {
      export type Params<T extends IBaseEntity> = IGetUseCase.Params<T>
  
      export interface Result<T> { total: number, items: T[] }
    }
  
    export namespace Register {
      export type Params<T extends IBaseEntity> = IInsertUseCase.Params<T>
  
      export type Result<T> = T
    }
  
    export namespace Update {
      export type Params<T extends IBaseEntity> = IUpdateUseCase.Params<T>
  
      export type Result<T> = T
    }
  
    export namespace Delete {
      export type Params = string
  
      export type Result = void
    }
  
    export namespace Activate {
      export type Params = string
  
      export type Result = void
    }
}   