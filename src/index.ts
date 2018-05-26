// tslint:disable-next-line no-var-requires
require('dotenv').config()

import makeDebug = require('debug')
import Koa = require('koa')
import bodyParser = require('koa-bodyparser')
import logger = require('koa-logger')
import Router = require('koa-router')
import websocketify = require('koa-websocket')
const debug = makeDebug('paperboy')

import DumbRouter from './DumbRouter'
import globals from './globals'
import Monitor from './Monitor'
import clear from './routes/clear'
import filter from './routes/filter'
import { send } from './utils'

export interface IWSRequest {
  path: string,
  args?: object,
}

const main = async () => {
  const requestDebug = makeDebug('paperboy:request')
  const PORT = process.env.PORT ||
    3000
  const DATABASE_URL = process.env.GNARLY_DATABASE_URL ||
    'postgres://postgres@127.0.0.1:5432/default'

  // initialize monitor
  globals.setMonitor(new Monitor(DATABASE_URL))

  // init server
  const app = websocketify(new Koa())
  const router = new Router()

  router.all('/', (routerCtx) => {
    const newError = (errorMessage) => {
      send(routerCtx, 'error', JSON.stringify({
        error: errorMessage,
      }))
    }

    const wsRouter = DumbRouter({
      '/filter': filter,
      '/clear': clear,
      '*': async (ctx: any, req: IWSRequest) => {
        return newError('404 Not Found')
      },
    })

    routerCtx.websocket.on('message', (message) => {
      let req: IWSRequest
      try {
        req = JSON.parse(message)
      } catch (error) {
        return newError(`Could not parse request ${message}.`)
      }
      requestDebug(`<-- ${req.path} ${JSON.stringify(req.args)}`)
      wsRouter.handle(routerCtx, req)
    })

  })

  app.ws
    .use(bodyParser())
    .use(logger((message) => requestDebug(message)))
    .use(router.routes())
    .use(router.allowedMethods())

  app.listen(PORT, () => {
    debug(`running on port ${PORT}`)
  })
}

process.on('unhandledRejection', (error) => {
  console.error(error.stack)
  process.exit(1)
})

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
