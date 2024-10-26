import { IBaseEntity } from '@/domain/entities/base-entity'
import { IUpdateUseCase } from '@/domain/@shared/usecases/update-usecase'
import { IBaseRepository } from '@/infra/database/interface/base-repository'

export class UpdateUseCase<T extends IBaseEntity, H = T> implements IUpdateUseCase<T, H> {
  private readonly _repository: IBaseRepository<T, H>

  constructor (private repository: IBaseRepository<T, H>) {
   this._repository = repository 
 }

  async perform (data: IUpdateUseCase.Params<H>): Promise<H extends IBaseEntity ? T : H> {
    return await this._repository.update(data)
  }
}