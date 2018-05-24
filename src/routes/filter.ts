import makeDebug = require('debug')
import _  = require('lodash')
import uuid = require('uuid')
import { IWSRequest } from '../'
import { IFilter, IFilterOptions } from '../Filter'
import globals from '../globals'
import { send } from '../utils'
const debug = makeDebug('paperboy:send')

interface IFilterRequest extends IWSRequest {
  args: IFilterOptions,
}

interface IFilterResponse {
  uuid: string
  txId: string
  patchId: string
  address: string
  event: string
  eventName: string
  signature: string
  args: object
  createdAt: Date
}

const validKeys = [
  'uuid',
  'txId',
  'patchId',
  'address',
  'event',
  'eventName',
  'signature',
  'args',
  'createdAt',
]

const toResponse = (event) => _.pickBy(event, (v, k) => validKeys.includes(k))

export default async (ctx: any, req: IFilterRequest) => {

  const onMatch = async (events: any[]): Promise<void> => {
    debug(`Sending ${events.length} events`)
    events.forEach((event) => {
      send(ctx, 'match', toResponse(event))
    })
  }

  const filterOptions = req.args
  const id = uuid.v4()
  const filter = {
    options: filterOptions,
    onMatch,
  }
  await globals.addFilter(id, filter)
  send(ctx, 'filter_id', id)
}
