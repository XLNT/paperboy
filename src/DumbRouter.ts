interface IRequest {
  path: string
}

const DumbRouter = (routes) => ({
  handle: (ctx: any, req: IRequest) => {
    const handler = routes[req.path]
    if (handler) {
      handler(ctx, req)
    } else {
      const notFound = routes['*']
      if (notFound) {
        notFound(ctx, req)
      } else {
        throw new Error(`
          Ok so you don't have the route ${req.path}
          AND you don't have a * route, so I'm not sure what you're
          expecting me to do. So fix that, yeah?
        `)
      }
    }
  },
})

export default DumbRouter
