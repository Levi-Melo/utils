import { Request, Response } from "express"
import { IController } from "@/domain/@shared/controller/base-controller"
import { IFacade } from "@/domain/@shared/facade/base-facade"
import { IBaseEntity } from "@/domain/entities/base-entity"

export abstract class BaseController<T extends IBaseEntity, G extends T = T , H extends T = T>  implements IController<T, G, H> {
    private readonly _facade:IFacade<T, G, H>
    
    constructor(facade:IFacade<T, G, H>){
        this._facade = facade
    }
    
    abstract getOne (req: Request, res: Response) : Promise<void>
    abstract get (req: Request, res: Response) : Promise<void>
    abstract register (req: Request, res: Response) : Promise<void>
    abstract update (req: Request, res: Response) : Promise<void>
    abstract delete (req: Request, res: Response) : Promise<void>
    abstract activate (req: Request, res: Response) : Promise<void>
}
