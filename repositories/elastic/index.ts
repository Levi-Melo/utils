import { Client, ClientOptions } from "@elastic/elasticsearch";
import { AggregationsDateHistogramBucket, BulkOperationContainer, BulkUpdateAction, MsearchMultisearchBody, MsearchMultisearchHeader, MsearchRequestItem, SearchRequest } from "@elastic/elasticsearch/lib/api/types";
import { NoSQLNamespace, NoSQLRepositoryInterface } from "./elastic-repository";
import { ElasticSearchRepositoryHelper } from "./helper";

interface BaseEntity{
  _id:string,
}

interface Props<Entity extends BaseEntity> {
  index: string
  entity: new (props: Entity) => Entity
  options: ClientOptions
}

export class ElasticSearchRepository<E extends BaseEntity> implements NoSQLRepositoryInterface<E> {
  private _client: Client
  private _entity: new (props: E) => E
  private _index: string
  private _helper: ElasticSearchRepositoryHelper<E>

  constructor(props: Props<E>) {
    this._index = props.index
    this._client = new Client(props.options)
    this._entity = props.entity
    this._helper = new ElasticSearchRepositoryHelper<E>({
      from: 0,
      size: 20,
      sort: ["_doc"]
    })
  }

  rebuildIndex(replaces: string[]): void {
    const parternItems = this._index.split(process.env.PATTERN_SEPARATOR ?? '-')
    const indexes = parternItems.map((elm, idx) => elm === 'replaceble' && idx).filter(el => el != false);
    indexes.forEach((replaceIndex, index)=>{
      parternItems[replaceIndex] = replaces[index] 
    })

    this._index = parternItems.join(process.env.PATTERN_SEPARATOR ?? '-')
    this._index = this._index.replace('env', process.env.ENVIRONMENT ?? 'dev')
  }

  get index(): string {
    return this._index
  }
  
  async deleteOne(input: NoSQLNamespace.DeleteOneInput<E>): Promise<NoSQLNamespace.DeleteResult<E>> {
      const { query } = input
      const _query = this._helper.prepareQuery(query)
      const { hits: metadata } = await this._client.search({ index: this._index, query: _query, size: 1 })
      await this._client.deleteByQuery({ index: this._index, query: _query, refresh: true })
      return {
        deleted: metadata?.hits as unknown as E[]
      }

  }

  async deleteMany(input: NoSQLNamespace.DeleteManyInput<E>): Promise<NoSQLNamespace.DeleteResult<E>> {
      const { query } = input
      const _query = this._helper.prepareQuery(query)
      const { hits: metadata } = await this._client.search({ index: this._index, query: _query })
      await this._client.deleteByQuery({ index: this._index, query: _query, refresh: true })
      return {
        deleted: metadata?.hits as unknown as E[]
      }

  }

  async timeline(input: NoSQLNamespace.TimelineInput<E>): Promise<NoSQLNamespace.TimelineResult> {
      const { query } = input
      const _query = this._helper.prepareQuery(query)
      let search = {
        index: this._index,
        query: {
          ..._query,
          bool: {
            ..._query.bool,
            filter: [
              {
                range: {
                  created_at: {
                    lte: "now"
                  }
                }
              }
            ]
          }
        },
        aggs: {
          daily_counts: {
            date_histogram: {
              field: "created_at",
              calendar_interval: "day",
              format: "yyyy-MM-dd",
              min_doc_count: 0,
            }
          }
        }
      } as SearchRequest
      const result = await this._client.search(search)
      const aggregate = result?.aggregations?.daily_counts as AggregationsDateHistogramBucket
      const buckets = aggregate.buckets as AggregationsDateHistogramBucket[]
      const timeline = buckets.map(item => {
        const dt = new Date(item.key)
        return {
          count: item.doc_count,
          _id: {
            year: dt.getUTCFullYear(),
            month: dt.getUTCMonth() + 1,
            day: dt.getUTCDate()
          }
        }
      })
      return {
        data: timeline
      }
  }

  async mcount(input: NoSQLNamespace.MCountInput<E>): Promise<NoSQLNamespace.MCountResult> {
      const { operations } = input
      const searches: MsearchRequestItem[] = new Array()

      for (let op of operations) {
        const { query } = op
        const _query = this._helper.prepareQuery(query)
        const head: MsearchMultisearchHeader = { index: this._index }
        const body: MsearchMultisearchBody = { query: _query, size: 0 }
        searches.push(head, body)
      }

      const { responses } = await this._client.msearch({
        searches
      })

      let count: { [key: string]: number } = responses
        .map((res, i) => ({ ...res, name: operations[i].name }))
        .filter((el: any) => el.status === 200 && el?.hits?.total?.value > 0)
        .map((item: any) => ({ [item.name]: item?.hits?.total?.value }))
        .reduce((acc, cur) => ({ ...acc, ...cur }), {})

      return {
        counted: count
      }
  }

  async count(input: NoSQLNamespace.CountInput<E>): Promise<NoSQLNamespace.CountResult> {
      const { query } = input
      const _query = this._helper.prepareQuery(query)
      const result = await this._client.count({
        index: this._index,
        query: _query
      })
      return {
        counted: result?.count ?? 0
      }
 
  }

  async createOne(input: NoSQLNamespace.CreateOneInput<E>): Promise<NoSQLNamespace.CreateResult<E>> {
      const { data } = input
      const _index = { index: { _index: this._index } }
      const _create = data
      let operations = [_index, _create]
      await this._client.bulk({ operations, refresh: true })
      return {
        created: [data]
      }
  }

  async createMany(input: NoSQLNamespace.CreateManyInput<E>): Promise<NoSQLNamespace.CreateResult<E>> {
      const { data } = input
      let operations = []
      for (const doc of data) {
        const _index = { index: { _index: this._index } }
        const _create = doc
        operations.push(_index, _create)
      }
      await this._client.bulk({ operations, refresh: true })
      return {
        created: data
      }
  }

  /**
   * this method takes an object to find many documents and an object to push item into array
   * @param query object that contain data to do a query on repository
   * @param value object that contain data to update the document
   * @param replace parameter to know if to replace or not all data updated on document  
   */
  async push(input: NoSQLNamespace.PushInput<E>): Promise<NoSQLNamespace.UpdateResult<E>> {
      const { query, value } = input
      const _query = this._helper.prepareQuery(query)
      const _value = this._helper.prepareValueToPush(value)

      const { hits: before } = await this._client.search({ index: this._index, query: _query })

      await this._client.updateByQuery({ index: this._index, query: _query, script: _value, refresh: true })

      const { hits: after } = await this._client.search({ index: this._index, query: _query })

      return {
        before: before?.hits as unknown as E[],
        updated: after?.hits as unknown as E[]
      }
  }

  /**
   * this method takes an object to find many documents and an object to pull item from array
   * @param query object that contain data to do a query on repository
   * @param value object that contain data to update the document
   * @param replace parameter to know if to replace or not all data updated on document  
   */
  async pull(input: NoSQLNamespace.PullInput<E>): Promise<NoSQLNamespace.UpdateResult<E>> {
      const { query, value } = input
      const _query = this._helper.prepareQuery(query)
      const _value = this._helper.prepareValueToPull(value)

      const { hits: before } = await this._client.search({ index: this._index, query: _query })

      await this._client.updateByQuery({ index: this._index, query: _query, script: _value, refresh: true })

      const { hits: after } = await this._client.search({ index: this._index, query: _query })

      return {
        before: before?.hits as unknown as E[],
        updated: after?.hits as unknown as E[]
      }
  }

  /**
   * this method takes an object to find one document and an object to update this document
   * @param query object that contain data to do a query on repository
   * @param value object that contain data to update the document
   * @param replace parameter to know if to replace or not all data updated on document  
   */
  async updateOne(input: NoSQLNamespace.UpdateOneInput<E>): Promise<NoSQLNamespace.UpdateResult<E>> {
      const { query, value, replace } = input
      const _query = this._helper.prepareQuery(query)
      const _value = this._helper.prepareValue(value, replace)

      const { hits: before } = await this._client.search({ index: this._index, query: _query, size: 1 })

      await this._client.updateByQuery({ index: this._index, query: _query, script: _value, refresh: true })

      const { hits: after } = await this._client.search({ index: this._index, query: _query, size: 1 })

      return {
        before: before?.hits as unknown as E[],
        updated: after?.hits as unknown as E[]
      }
  }

  /**
   * this method takes an object to find many documents and an object to update documents
   * @param query object that contain data to do a query on repository
   * @param value object that contain data to update the documents
   * @param replace parameter to know if to replace or not all data updated on documents
   */
  async updateMany(input: NoSQLNamespace.UpdateManyInput<E>): Promise<NoSQLNamespace.UpdateResult<E>> {
      const { query, value, replace } = input
      const _query = this._helper.prepareQuery(query)
      const _value = this._helper.prepareValue(value, replace)

      const { hits: before } = await this._client.search({ index: this._index, query: _query })

      await this._client.updateByQuery({ index: this._index, query: _query, script: _value, refresh: true })

      const { hits: after } = await this._client.search({ index: this._index, query: _query })

      return {
        before: before?.hits as unknown as E[],
        updated: after?.hits as unknown as E[]
      }
  }

  /**
   * this method takes an object to find one document.
   * @param query object that contain data to do a query on repository
  */
  async findOne(input: NoSQLNamespace.FindOneInput<E>): Promise<NoSQLNamespace.FindOneResult<E>> {
      const { query, fields } = input
      const _query = this._helper.prepareQuery(query)
      const _source = this._helper.prepareFields(fields)
      const records = await this._client.search({ index: this._index, query: _query, size: 1, _source })
      const [hit] = records?.hits?.hits
      return {
        data: new this._entity(hit?._source as unknown as E),
        metadata: {
          total: 1,
          rows: 1,
          from: this._helper.from,
          size: this._helper.size
        }
      }
  }

  /**
   * this method takes an object to find many documents.
   * @param query object that contain data to do a query on repository
   * @param pagination object that contain data to paginate results
   * @param sort object that contain data to sort results
  */
  async findMany(input: NoSQLNamespace.FindManyInput<E>): Promise<NoSQLNamespace.FindManyResult<E>> {
      const { query, pagination, sort, fields } = input
      const _query = this._helper.prepareQuery(query)
      const _pagination = this._helper.preparePagination(pagination)
      const _sort = this._helper.prepareSort(sort)
      const _source = this._helper.prepareFields(fields)
      const metadata = await this._client.count({ index: this._index, query: _query })
      const records = await this._client.search({ index: this._index, query: _query, ..._pagination, sort: _sort, _source })
      return {
        data: records?.hits?.hits.map(item => new this._entity(item._source as unknown as E)),
        metadata: {
          total: metadata.count,
          rows: records?.hits?.hits?.length,
          from: _pagination.from,
          size: _pagination.size
        }
      }
  }

  /**
   * this method takes an object to find many documents and return them in stream.
   * @param query object that contain data to do a query on repository
  */
  async findManyStream(input: NoSQLNamespace.FindManyStreamInput<E>, call: NoSQLNamespace.Call<E>): Promise<void> {
    const quantityItemsInWrite = 350
      const { query, sort, fields } = input
      const _query = this._helper.prepareQuery(query)
      const _sort = this._helper.prepareSort(sort)
      const _source = this._helper.prepareFields(fields)

      const { hits, _scroll_id } = await this._client.search({
        index: this._index,
        query: _query,
        sort: _sort,
        _source,
        size: 1000,
        scroll: '1m'
      })

      let scroll_id = _scroll_id
      let records = hits.hits

      for (let h = 0; h < records.length; h += quantityItemsInWrite) {
        call.write(records.slice(h, h + quantityItemsInWrite).map(item => item._source) as unknown as E[])
      }

      while (records.length > 0) {
        const { hits, _scroll_id } = await this._client.scroll({
          scroll_id,
          scroll: '1m'
        })
        records = hits.hits
        scroll_id = _scroll_id
        for (let h = 0; h < records.length; h += quantityItemsInWrite) {
          call.write(records.slice(h, h + quantityItemsInWrite).map(item => item._source) as unknown as E[])
        }
      }

      scroll_id && await this._client.clearScroll({ scroll_id: [scroll_id] })
      call.end()
  }

}