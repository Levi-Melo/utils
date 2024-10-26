type IBaseEntity= {
    _id:string
}
export type FindOptions<T> = Partial<T> 
  
export type FindOptionsRelationsProperty<Property> = true |  FindOptionsRelations<Property>
/**
 * Relations find options.
 */
export type FindOptionsRelations<Entity> = {
    [P in keyof Entity]?: Entity[P] extends IBaseEntity ? FindOptionsRelationsProperty<Entity[P]>: Entity[P] extends Array<infer Item> ? Item extends IBaseEntity  ? FindOptionsRelationsProperty<Item> : never : never
};


export type FindOptionsOrderProperty<Property> = true |  FindOptionsOrder<Property>
/**
 * Relations find options.
 */
export type FindOptionsOrder<Entity> = {
    [P in keyof Entity]?: Entity[P] extends IBaseEntity ? FindOptionsOrderProperty<Entity[P]>: Entity[P] extends Array<infer Item> ? Item extends IBaseEntity  ? FindOptionsOrderProperty<Item> : never : never
};

