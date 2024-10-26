import { IGetUseCase } from '@/domain/@shared/usecases/get-usecase'
import { IBaseEntity } from '@/domain/entities/base-entity'
import { IBaseRepository } from '@/infra/database/interface/base-repository'

export class GetUseCase<T extends IBaseEntity, H = T> implements IGetUseCase<T> {
  private readonly _repository: IBaseRepository<T, H>
  constructor (private repository: IBaseRepository<T, H>) {
    this._repository = repository 
  }

  async perform (data: IGetUseCase.Params<T>): Promise<IGetUseCase.Result<T>> {
    return await this._repository.get(data)
  
  }
}