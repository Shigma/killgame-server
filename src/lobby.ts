import { Room, Client } from 'colyseus'
import GameRoom from './room'
import chalk from 'chalk'

export let lobby: Lobby = null

export default class Lobby extends Room {
  maxClients = 10000

  _client: Record<string, {
    name?: string
  }> = {}

  _rooms: Record<string, GameRoom> = {}

  get rooms () {
    return Object.keys(this._rooms).map((id) => {
      const room = this._rooms[id]
      return {
        id
      }
    })
  }

  addRoom (room: GameRoom) {
    this._rooms[room.roomId] = room
    console.log('room add:', room.roomId)
    this.broadcast({
      type: 'rooms',
      data: this.rooms,
    })
  }

  disposeRoom (room: GameRoom) {
    delete this._rooms[room.roomId]
    console.log('room remove:', room.roomId)
    this.broadcast({
      type: 'rooms',
      data: this.rooms,
    })
  }

  onInit (options) {
    lobby = this
    console.log(chalk.yellowBright('Lobby initialized.'))
  }

  onJoin (client: Client, options = {}, auth) {
    console.log('client join:', client.sessionId)
    this._client[client.sessionId] = {}
    this.broadcast({
      type: 'rooms',
      data: this.rooms,
    })
  }

  onLeave (client: Client, consented: boolean) {
    console.log('client leave:', client.sessionId)
    delete this._client[client.sessionId]
  }

  onMessage(client: Client, data) {
    // this.broadcast(this.clients)
  }
}
