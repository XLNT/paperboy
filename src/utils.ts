
export const send = (ctx, type, data) =>
  ctx.websocket.send(JSON.stringify({
    type,
    data,
  }))
