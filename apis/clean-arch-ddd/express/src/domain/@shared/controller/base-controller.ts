import { Request, Response } from 'express'
import { IBaseEntity } from '@/domain/entities/base-entity'

export interface IController<T extends IBaseEntity, G extends T = T , H extends T = T>  {
  getOne: (req:Request, res:Response) => Promise<void>
  get: (req:Request, res:Response) => Promise<void>
  register: (req:Request, res:Response) => Promise<void>
  update: (req:Request, res:Response) => Promise<void>
  delete: (req:Request, res:Response, ) => Promise<void>
  activate: (req:Request, res:Response, ) => Promise<void>
}
