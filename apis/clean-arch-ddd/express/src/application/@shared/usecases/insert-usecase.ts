import { IBaseEntity } from '@/domain/entities/base-entity'
import { IInsertUseCase } from '@/domain/@shared/usecases/insert-usecase'
import { IBaseRepository } from '@/infra/database/interface/base-repository'

export class InsertUseCase<T extends IBaseEntity, H = T> implements IInsertUseCase<T, H> {
   private readonly _repository: IBaseRepository<T, H>

   constructor (private repository: IBaseRepository<T, H>) {
    this._repository = repository 
  }

  async perform (data: IInsertUseCase.Params<H>): Promise<H extends IBaseEntity ? T : H> {
    return await this._repository.insert(data)
  }
}