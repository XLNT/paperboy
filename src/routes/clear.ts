import uuid = require('uuid')
import { IWSRequest } from '../'
import globals from '../globals'
import { send } from '../utils'

interface IClearRequest extends IWSRequest {
  args: {
    id: string,
  }
}

export default async (ctx: any, req: IClearRequest) => {
  const id = req.args.id

  await globals.removeFilter(id)
  send(ctx, 'pong', id)
}
