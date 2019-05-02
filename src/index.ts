import express from 'express'
import { createServer } from 'http'
import { Server } from 'colyseus'
import { monitor } from '@colyseus/monitor'

import Room from './room'

const port = Number(process.env.PORT || 2567)
const app = express()

// Attach WebSocket Server on HTTP Server.
const gameServer = new Server({
  server: createServer(app)
})

gameServer.register('killgame', Room)

// (optional) attach web monitoring panel
app.use('/colyseus', monitor(gameServer))

gameServer.onShutdown(function(){
  console.log(`game server is going down.`)
})

gameServer.listen(port)

console.log(`Listening on http://localhost:${ port }`)
