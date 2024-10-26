import { DataSource } from 'typeorm'
import { BaseRepository } from '../database/repositories/@shared'
import { IBaseEntity } from '@/domain/entities'
import { BaseEntity } from '@/application/entities'
import { ActivateUseCase, DeleteUseCase,GetOneUseCase,GetUseCase,InsertUseCase,UpdateUseCase } from '@/application/@shared/usecases'
import { BaseFacade } from '@/application/@shared/facade'
import { BaseController } from './controllers/@shared'
import { IController } from '@/domain/@shared/controller'
import {Request, Response} from 'express'

export class ExampleBaseController<T extends IBaseEntity, G extends T = T , H extends T = T> extends BaseController<T,G,H>{
    async getOne (req: Request, res: Response): Promise<void>{
        throw new Error('not implemented')
    }
    async get (req: Request, res: Response): Promise<void>{
        throw new Error('not implemented')
    }
    async register (req: Request, res: Response): Promise<void>{
        throw new Error('not implemented')
    }
    async update (req: Request, res: Response): Promise<void>{
        throw new Error('not implemented')
    }
    async delete (req: Request, res: Response ): Promise<void>{
        throw new Error('not implemented')
    }
    async activate (req: Request, res: Response ): Promise<void>{
        throw new Error('not implemented')
    }

}
export class Factory {
    static perform(){
        const dataSource = new DataSource({} as any)
        const baseRepo = new BaseRepository<IBaseEntity>(dataSource, new BaseEntity)

        const activateUseCase = new ActivateUseCase(baseRepo) 
        const deleteUseCase = new DeleteUseCase(baseRepo)
        const getOneUseCase = new GetOneUseCase(baseRepo)
        const getUseCase = new GetUseCase(baseRepo)
        const insertUseCase = new InsertUseCase(baseRepo)
        const updateUseCase = new UpdateUseCase(baseRepo)

        const facade = new BaseFacade({
            activateUseCase,
            deleteUseCase,
            getOneUseCase,
            getUseCase,
            insertUseCase,
            updateUseCase
        })

         return new ExampleBaseController(facade)
    }
}