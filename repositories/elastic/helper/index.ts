import { NoSQLNamespace } from "../elastic-repository"

interface Props {
  from: number
  size: number
  sort: string[]
}
export class ElasticSearchRepositoryHelper<E> {
  from: number = 0
  size: number = 20
  sort: string[] = ["_doc"]

  constructor(props: Props) {
    Object.assign(props)
  }

  prepareSort(sort?: NoSQLNamespace.Sort<E>): any {
    if (!sort) return this.sort
    let _sort = this.transformObject(sort)
    _sort = Object
      .entries(_sort)
      .map(([key, value]) => ({ [key]: { order: value } }))
    return _sort
  }

  prepareFields(fields?: NoSQLNamespace.Fields<E>): any {
    if (!fields) return {}
    const _source: any = {
      includes: [],
      excludes: []
    }
    for (let k in fields) {
      if (fields[k]) {
        _source.includes.push(k)
      } else {
        _source.excludes.push(k)
      }
    }
    return _source
  }

  preparePagination(paginantion?: NoSQLNamespace.Pagination): any {
    return {
      from: paginantion?.from ?? this.from,
      size: paginantion?.size ?? this.size,
    }
  }

  prepareValue(value: NoSQLNamespace.Value<E>, replace: boolean = false): any {
    const _value = replace ? value : this.decodeValue(value)

    const prefix = 'ctx._source.'
    const sufix = "params['"
    let source = ""
    for (let item in _value) {
      source += `${prefix}${item}=${sufix}${item}']; `
    }

    return {
      "source": source,
      "lang": "painless",
      "params": _value
    }
  }

  prepareValueToPush(value: NoSQLNamespace.Value<E>): any {
    const _value = value as any

    let source = "";

    for (let item in _value) {
      if (Array.isArray(_value[item]) && _value[item].every((el: any) => typeof el !== 'object')) {
        source += `
          if (!ctx._source.containsKey('${item}')) {
            ctx._source['${item}'] = [];
          }
          Set uniqueSet = new HashSet();
          uniqueSet.addAll(ctx._source['${item}']);
          uniqueSet.addAll(params['${item}']);
          ctx._source['${item}'] = uniqueSet.toArray();
        `;
      } else if (Array.isArray(_value[item]) && _value[item].every((el: any) => typeof el === 'object')) {
        source += `
          if (!ctx._source.containsKey('${item}')) {
            ctx._source['${item}'] = [];
          }
          for (def obj : params['${item}']) {
            if (!ctx._source['${item}'].contains(obj)) {
              ctx._source['${item}'].add(obj);
            }
          }
        `;
      }
    }

    return {
      "source": source,
      "lang": "painless",
      "params": _value
    }
  }

  prepareValueToPull(value: NoSQLNamespace.Value<E>): any {
    const _value = value as any

    let source = ""

    for (let item in _value) {
      if (!Array.isArray(_value[item])) {
        continue
      }
      source += `
        ArrayList list = new ArrayList(ctx._source.${item}); 
        for (int i = 0; i < params.${item}.length; i++) { 
          list.removeIf(item -> item == params.${item}[i]); 
        } 
        ctx._source.${item} = list.toArray();
      `
    }

    return {
      "source": source,
      "lang": "painless",
      "params": _value
    }
  }

  prepareValueToUpdateArray(value: NoSQLNamespace.ArrayValue<E>, arrayQuery: NoSQLNamespace.ArrayQuery<E>, field: keyof E): any {
    const _value = value[field]
    const _query = arrayQuery[field]
    const source = `
      def query = params.query;
      def value = params.value;
      
      for (int i = 0; i < ctx._source.${String(field)}.length; i++) {
        def item = ctx._source.${String(field)}[i];
        boolean match = true;
        
        // Verifica se o item atende às propriedades da query
        for (def entry : query.entrySet()) {
          def key = entry.getKey();
          def queryValue = entry.getValue();
          
          if (item[key] != queryValue) {
            match = false;
            break;
          }
        }
        
        // Se o item atender às propriedades da query, atualiza com o valor de value
        if (match) {
          ctx._source.${String(field)}[i].putAll(value);
        }
      }
    `

    return {
      "source": source,
      "lang": "painless",
      "params": {
        value: _value,
        query: _query
      }
    }
  }

  decodeValue(value: NoSQLNamespace.Value<E>) {
    let _value = this.transformObject(value)
    return _value
  }

  prepareQuery(query: NoSQLNamespace.CompoundQuery<E>): any {
    const _query = this.decodeQuery(query)
    return _query
  }

  /**
   * transforming the query object
   * @param query object that can be received in the repository method
   * @example 
  */
  decodeQuery(query: NoSQLNamespace.CompoundQuery<E>): any {
    const base = { must: [] } as any
    let _query = this.transformObject(query)
    for (let key in _query) {
      let value = _query[key]
      if (Array.isArray(value) && ['must', 'must_not', 'should'].includes(key)) {
        for (let item of value) {
          let _item = this.transformObject(item)
          for (let ikey in _item) {
            let ivalue = _item[ikey]
            const _ivalue = this.decodeQueryValue(ikey, ivalue)
            if (typeof _ivalue === "object" && Array.isArray(_ivalue)) {
              if (Array.isArray(base[`${key}`])) {
                base[`${key}`].push(..._ivalue)
              } else {
                base[`${key}`] = []
                base[`${key}`].push(..._ivalue)
              }
            } else {
              if (Array.isArray(base[`${key}`])) {
                base[`${key}`].push(_ivalue)
              } else {
                base[`${key}`] = []
                base[`${key}`].push(_ivalue)
              }
            }

          }
        }
      } else {
        const _value = this.decodeQueryValue(key, value)
        if (typeof _value === "object" && Array.isArray(_value)) {
          base.must.push(..._value)
        } else {
          base.must.push(_value)
        }
      }
    }
    if (base.hasOwnProperty("should") && base.hasOwnProperty("must")) {
      base.must.push({ bool: { should: base.should } })
      delete base.should
    }
    return { bool: base }
  }

  decodeQueryValue(key: string, value: any) {
    if (
      typeof value === 'object' && Object.keys(value).length > 0 && Object.keys(value).every(item => Object.keys(this.types()).includes(item))
    ) {
      return this.queryValueByType(key, value)
    } else {
      return { term: { [key + (typeof value === "string" ? ".keyword" : "")]: value } }
    }
  }

  queryValueByType(key: string, value: any) {
    if (typeof value !== "object") {
      return { match_phrase: { [key]: value } }
    }
    let _value: any = Object.entries(value).map(([key, val]) => ({ [this.types()[key]]: val })).reduce((_, cur) => ({ ...cur }), {})
    switch (Object.keys(_value)?.[0]) {
      case 'lt':
        return { range: { [key]: Object.entries(value).map(([key, val]) => ({ [this.types()[key]]: val })).reduce((acc, cur) => ({ ...acc, ...cur }), {}) } }
      case 'lte':
        return { range: { [key]: Object.entries(value).map(([key, val]) => ({ [this.types()[key]]: val })).reduce((acc, cur) => ({ ...acc, ...cur }), {}) } }
      case 'gt':
        return { range: { [key]: Object.entries(value).map(([key, val]) => ({ [this.types()[key]]: val })).reduce((acc, cur) => ({ ...acc, ...cur }), {}) } }
      case 'gte':
        return { range: { [key]: Object.entries(value).map(([key, val]) => ({ [this.types()[key]]: val })).reduce((acc, cur) => ({ ...acc, ...cur }), {}) } }
      case 'in':
        // return { terms: { [key]: _value.in } }
        return { bool: { should: _value.in.map((item: any) => ({ match_phrase: { [key]: item } })) } }
      case 'nin':
        return { bool: { must_not: { terms: { [key]: _value.nin } } } }
      case 'eq':
        return { term: { [key + (typeof _value.eq === "string" ? ".keyword" : "")]: _value.eq } }
      case 'ne':
        return { bool: { must_not: { match: { [key]: _value.ne } } } }
      case 'elemMatch':
        return Object.entries(value.elemMatch).map(([_key, _value]) => ({ match_phrase: { [key + "." + _key]: _value } }))
      case 'exists':
        return { exists: { field: key } }
      case 'regex':
        return { regexp: { [key]: `.*${_value.regex?.toLowerCase()}.*` } }
      // return { match_phrase: { [key]: _value.regex } }
      case 'size':
        return { script: { script: `params._source.${key}.size() == ${_value.size}` } }
      default:
        // return { match_phrase: { [key]: _value } }
        return { term: { [key + (typeof _value === "string" ? ".keyword" : "")]: _value } }
    }
  }

  transformObject(obj: any, prefix = ''): any {
    const result = {} as { [a: string]: any };
    for (const key in obj) {
      if (
        typeof obj[key] === 'object' &&
        !Array.isArray(obj[key]) &&
        !(Object.keys(obj[key]).every(item => Object.keys(this.types()).includes(item)))
      ) {
        const nestedObj = this.transformObject(obj[key], `${prefix}${key}.`);
        Object.assign(result, nestedObj);
      } else {
        result[`${prefix}${key}`] = obj[key];
      }
    }
    return result;
  }

  types(): { [prop: string]: string } {
    return {
      'in': 'in',
      'nin': 'nin',
      'eq': 'eq',
      'ne': 'ne',
      'gt': 'gt',
      'gte': 'gte',
      'lt': 'lt',
      'lte': 'lte',
      'type': 'type',
      'exists': 'exists',
      'size': 'size',
      'regex': 'regex',
      'elemMatch': 'elemMatch',
    }
  }

}