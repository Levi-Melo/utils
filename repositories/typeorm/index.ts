import { DataSource, EntityManager, Between,FindOptionsWhereProperty as ORMFindOptionsWhere ,FindManyOptions,FindOptionsOrder as ORMFindOptionsOrder, FindOptionsRelations as ORMFindOptionsRelations, FindOptionsWhere, Repository, FindOptionsSelect, FindOptionsSelectByString } from "typeorm";
import { IBaseRepository } from "./base-repository";
import { IBaseEntity } from "./base-entity";
import { IOverrideMapper } from "../../mappers/overrideMapper/override-mapper.interface";
import { Path } from "../../interfaces/path";

export class BaseRepository<T extends IBaseEntity, H = T>  implements IBaseRepository<T,H>{
    private readonly runner: EntityManager
    private readonly _overrideMapper: IOverrideMapper
    constructor(
        private readonly dataSource: DataSource,
        private readonly baseEntity: T,
        private readonly overrideMapper: IOverrideMapper
  ){  
        this.runner = this.dataSource.createEntityManager()
    }
    async get (
        {
        since,
        until = new Date(),
        page = 1,
        size = 10,
        params,
        relations,
        select,
        order,
        notPage = false,
        }: IBaseRepository.Get.Params<T>): Promise<IBaseRepository.Get.Result<T>>{
            const where = this.convertWhere<T>(params, until, since)

            let options: FindManyOptions<T> = {
              relations: { ...relations } as ORMFindOptionsRelations<T>,
              where,
              select: this._overrideMapper.perform<T, Path<T>[], true>({
                data: [this.baseEntity],
                fields: select,
                subst: true
              }) as unknown as FindOptionsSelect<T>,
              take: size,
              skip: (page - 1) * size,
              order: order as ORMFindOptionsOrder<T>
            }
        
            if (notPage) {
              options = {
                relations: { ...relations } as ORMFindOptionsRelations<T>,
                where,
                select: this._overrideMapper.perform<T, Path<T>[], true>({
                  data: [this.baseEntity],
                  fields: select,
                  subst: true
                }) as unknown as FindOptionsSelect<T>,
                order: order as ORMFindOptionsOrder<T>
              }
            }
    
        return await this.runner.findAndCount(this.baseEntity as any, options)
    }

    async getOne ({ relations, where }: IBaseRepository.GetOne.Params<T>): Promise<IBaseRepository.GetOne.Result<T>> {
        const newWhere = this.convertWhere<T>(where, new Date())
        const runner = this.dataSource.createEntityManager()
        return await runner.findOne(this.baseEntity as any, {
            relations: { ...relations } as ORMFindOptionsRelations<T>,
            where: newWhere,
        })
    }

    async activate (data: IBaseRepository.DeleteActivate.Params): Promise<IBaseRepository.DeleteActivate.Result>{
        this.runner.save(this.baseEntity as any, { ...data, activate: true })
    }
    
    async delete (data: IBaseRepository.DeleteActivate.Params): Promise<IBaseRepository.DeleteActivate.Result>{
        this.runner.save(this.baseEntity as any, { ...data, activate: false })
    }

    private async save ({ params, order }: IBaseRepository.Save.Params<H>): Promise<H extends IBaseEntity ? T : H> {
        let response: any = {}

    
          /*
            Documentação do bloco try-catch, feita com base nesse objeto de exemplo:
    
            order: {
              0: {
                prop: 'car',
                fk: [
                  {
                    locationOfProp: 'cars',
                    prop: 'carId',
                  },
                ],
              },
              1: {
                prop: 'address',
                fk: [
                  {
                    locationOfProp: 'addresses',
                    prop: 'addressId',
                  },
                ],
              },
            },
          */
          await this.runner.transaction(async (manager) => {
            if (order !== undefined) {
              // itera sobre as chaves primárias do objeto order (0, 1, 2)
              for (const key in order) {
                // exemplo da primeira iteração -> order[0].prop = 'car'
                // se params['car'] for um array, vai iterar sobre esse array, salvando/editando os itens no banco
                  //@ts-ignore
                if (Array.isArray(params[order[key].prop])) {
                  // salva o item criado/editado no banco em uma variável
                  //@ts-ignore
                  const saved = await Promise.all((params[order[key].prop] as any[]).map(async (item: any) => {
                    if (Array.isArray(item)) {
                      const res: any[] = []
                      for (let i = 0; i < item.length; i++) {
                        res.push(await manager.save(order[key].entity, { ...item[i] }))
                      }
                      return res
                    } else {
                      return await manager.save(order[key].entity, { ...item })
                    }
                  }))
    
                  /* edita o objeto response com os objetos inseridos no banco:
                      response = {
                        'car': databaseJsons[]
                      }
                    */
                  response[order[key].prop] = saved
    
                  // se params['car'] não for um array, vai criar o item no banco fora de um map,
                  // fazendo apenas uma inserção
                } else {
                  // se params['car'] não for undefined, vai salvar esse item no banco
                  //@ts-ignore
                  if (params[order[key].prop] !== undefined) {
                    let saved
                  //@ts-ignore
                    if (Array.isArray(params[order[key].prop])) {
                  //@ts-ignore
                      saved = await Promise.all((params[order[key].prop] as any[]).map(async (item) => {
                        return await manager.save(order[key].entity, { ...item })
                      }))
                    } else {
                  //@ts-ignore
                      saved = await manager.save(order[key].entity as any, { ...params[order[key].prop] })
                      /* edita o objeto response com o objeto inserido no banco:
                      response = {
                        'car': databaseJson
                      }
                      */
                    }
                    response[order[key].prop] = saved
    
                    // exemplo da primeira iteração -> order[0].fk = [{ locationOfProp: 'addresses', prop: 'addressId' }]
                    // se a propriedade order[0].fk não for undefined, vai iterar sobre esse objeto com um loop for
                    if (order[key].fk !== undefined) {
                      // na primeira iteração do forEach -> locationOfProp = 'addresses', prop = 'addressId'
                      order[key].fk?.forEach(({ locationOfProp, prop }) => {
                        // se params['addresses'] for um array (insert/update multiplo),
                        // vai iterar sobre cada um desses elementos
                  //@ts-ignore
                        if (Array.isArray(params[locationOfProp])) {
                          // para cada um dos objetos em address, se address.addressId (element[prop]) for diferente de undefined,
                          // faz com que o objeto criado no banco seja atribuido à element[prop], nesse caso, o objeto criado no banco
                          // ficaria dessa forma: address['addressId'] = databaseJson para cada um dos itens
                          (params[locationOfProp] as any[]).forEach((element: any) => {
                            element[prop] = saved
                          })
                        } else {
                          // mesmo caso de cima para um objeto único no parametro params['addresses']
                          //@ts-ignore
                          if (params[locationOfProp] != undefined) { params[locationOfProp][prop] = saved }
                        }
                      })
                    }
                  }
                }
              }
            } else {
              // caso não possua order, salva no banco normalmente
              response = await manager.save(this.baseEntity as any, { ...params })
            }
          })
    
        // faz um commit da transaction (completa a criação de fato) caso não ocorra nenhum erro
    
        // retorna o objeto response alterado
        return response
    }

    async insert (data: IBaseRepository.Insert.Params<H>): Promise<H extends IBaseEntity ? T : H> {
        return await this.save(data as any)
    }

    async update(data: IBaseRepository.Update.Params<H>): Promise<H extends IBaseEntity ? T : H> {
        return await this.save(data)
    }


    
  private convertWhere<T> (where: Array<FindOptions<T>> | FindOptions<T> | undefined, until: Date, since?: Date): FindOptionsWhere<T> | Array<FindOptionsWhere<T>> {
    let converted: Array<ORMFindOptionsWhere<any>> | ORMFindOptionsWhere<any> | undefined = where
    if (since != null) {
      if (Array.isArray(converted)) {
        converted.forEach((item) => {
          item = { ...item, createdAt: Between(since, until) }
        })
      } else {
        converted = { ...converted, createdAt: Between(since, until) }
      }
    }
    return converted
  }
}

type FindOptions<T> = Partial<T> 
