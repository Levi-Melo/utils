import { IActivateUseCase } from '@/domain/@shared/usecases/activate-usecase'
import { IBaseEntity } from '@/domain/entities/base-entity'
import { IBaseRepository } from '@/infra/database/interface/base-repository'

export class ActivateUseCase<T extends IBaseEntity, H = T> implements IActivateUseCase{
  private readonly _repository: IBaseRepository<T, H>
  constructor (private repository: IBaseRepository<T, H>) {
    this._repository = repository 
  }

  async perform (data: IActivateUseCase.Params): Promise<IActivateUseCase.Result> {
    await this._repository.activate(data)
  }
}