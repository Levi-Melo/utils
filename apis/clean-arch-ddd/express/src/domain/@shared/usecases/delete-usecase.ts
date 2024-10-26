export interface IDeleteUseCase {
    perform: (data: IDeleteUseCase.Params) => Promise<IDeleteUseCase.Result>
  }
  
  export namespace IDeleteUseCase {
    export interface Params { _id: string }
  
    export type Result = void
  }