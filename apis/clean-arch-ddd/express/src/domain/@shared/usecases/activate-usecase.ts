export interface IActivateUseCase {
    perform: (data: IActivateUseCase.Params) => Promise<IActivateUseCase.Result>
  }
  
  export namespace IActivateUseCase {
    export interface Params { _id: string }
  
    export type Result = void
  }