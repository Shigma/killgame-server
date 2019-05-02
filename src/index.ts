import cac from 'cac'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'colyseus'
import { monitor } from '@colyseus/monitor'

import Room from './room'
import Lobby from './lobby'

const app = express()
const cli = cac()
  .option('-p, --port [port]', 'port')
  .option('-d, --dev', 'development')

const { options } = cli.parse()
const { port = 2567, dev } = options

// attach WebSocket server on HTTP server
const gameServer = new Server({
  server: createServer(app)
})

gameServer.register('killgame', Room)
gameServer.register('killgame-lobby', Lobby)

if (dev) {
  // attach web monitoring panel in dev mode
  app.use('/colyseus', monitor(gameServer))
}

gameServer.onShutdown(() => {
  console.log(`Game server is going down.`)
})

gameServer.listen(port)

console.log(`Server listening on http://localhost:${port}`)
