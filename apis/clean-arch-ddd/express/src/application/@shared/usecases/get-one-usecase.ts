import { IGetOneUseCase } from '@/domain/@shared/usecases/get-one-usecase'
import { IBaseEntity } from '@/domain/entities/base-entity'
import { IBaseRepository } from '@/infra/database/interface/base-repository'

export class GetOneUseCase<T extends IBaseEntity, H = T> implements IGetOneUseCase<T> {
  private readonly _repository: IBaseRepository<T, H>
  constructor (private repository: IBaseRepository<T, H>) {
    this._repository = repository 
  }

  async perform (data: IGetOneUseCase.Params<T>): Promise<IGetOneUseCase.Result<T>> {
    return await this._repository.getOne(data)
  
  }
}