import { IDeleteUseCase } from '@/domain/@shared/usecases/delete-usecase'
import { IBaseEntity } from '@/domain/entities/base-entity'
import { IBaseRepository } from '@/infra/database/interface/base-repository'

export class DeleteUseCase<T extends IBaseEntity, H = T> implements IDeleteUseCase{
  private readonly _repository: IBaseRepository<T, H>
  constructor (private repository: IBaseRepository<T, H>) {
    this._repository = repository 
  }

  async perform (data: IDeleteUseCase.Params): Promise<IDeleteUseCase.Result> {
    await this._repository.delete(data)
  }
}