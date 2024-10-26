import { IFacade } from "@/domain/@shared/facade/base-facade"
import { IActivateUseCase,IDeleteUseCase,IGetUseCase,IGetOneUseCase,IInsertUseCase,IUpdateUseCase } from '@/domain/@shared/usecases'
import { IBaseEntity } from "@/domain/entities/base-entity"

export class BaseFacade<T extends IBaseEntity, G extends T = T , H extends T = T> implements IFacade<T, G, H> {
    private readonly _getOneUseCase: IGetOneUseCase<T,G>
    private readonly _getUseCase: IGetUseCase<T,G>
    private readonly _insertUseCase: IInsertUseCase<T,H>
    private readonly _updateUseCase: IUpdateUseCase<T,H>
    private readonly _deleteUseCase: IDeleteUseCase
    private readonly _activateUseCase: IActivateUseCase

    constructor(props:IFacade.Constructor<T, G, H>){
        this._getOneUseCase = props.getOneUseCase
        this._getUseCase = props.getUseCase
        this._insertUseCase = props.insertUseCase
        this._updateUseCase = props.updateUseCase
        this._deleteUseCase = props.deleteUseCase
        this._activateUseCase = props.activateUseCase
    }
    async getOne (data: IFacade.GetOne.Params<G>): Promise<IFacade.GetOne.Result<T>>{
        const item = await this._getOneUseCase.perform(data)
        if(!item){
            throw new Error()
        }
        return {item}
    }
    
    async get (data: IFacade.Get.Params<G>):Promise<IFacade.Get.Result<T>>{
        const [items,total] = await this._getUseCase.perform(data)
        return {items,total}
    }

    async register (data: IFacade.Register.Params<H>):Promise<T>{
       return await this._insertUseCase.perform(data)
    }

    async update (data: IFacade.Update.Params<H>):Promise<T>{
        return await this._updateUseCase.perform(data)
    }

    async delete (data: IFacade.Delete.Params): Promise<IFacade.Delete.Result>{
        await this._deleteUseCase.perform({_id:data})
    }
    async activate (data: IFacade.Activate.Params): Promise<IFacade.Activate.Result>{
        await this._activateUseCase.perform({_id:data})
    }
    
}