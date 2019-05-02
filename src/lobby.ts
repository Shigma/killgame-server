import { Room, Client } from 'colyseus'
import GameRoom from './room'
import chalk from 'chalk'

export let lobby: Lobby = null

interface UserOptions {
  name: string
}

export default class Lobby extends Room {
  maxClients = 10000

  _users: Record<string, UserOptions> = {}
  _rooms: Record<string, GameRoom> = {}

  get rooms () {
    return Object.keys(this._rooms).map((id) => {
      const room = this._rooms[id]
      const { name, maxClients = 12, userId } = room.options
      return {
        id,
        name,
        maxClients,
        ownerId: userId,
        clients: room.clients.map(client => client.sessionId),
      }
    })
  }

  broadcastRooms () {
    this.broadcast({
      type: 'rooms',
      data: this.rooms,
    })
  }

  broadcastUsers () {
    this.broadcast({
      type: 'users',
      data: this._users,
    })
  }

  addRoom (room: GameRoom) {
    this._rooms[room.roomId] = room
    console.log('room add:', room.roomId)
    this.broadcastRooms()
  }

  disposeRoom (room: GameRoom) {
    delete this._rooms[room.roomId]
    console.log('room remove:', room.roomId)
    this.broadcastRooms()
  }

  onInit (options) {
    lobby = this
    console.log(chalk.yellowBright('Lobby initialized.'))
  }

  onJoin (client: Client, options: UserOptions, auth) {
    const { name } = options
    this._users[client.sessionId] = { name }
    console.log('client join:', `${chalk.cyanBright(name)} (${client.sessionId})`)
    this.broadcastRooms()
    this.broadcastUsers()
  }

  onLeave (client: Client, consented: boolean) {
    const { name } = this._users[client.sessionId]
    console.log('client leave:', `${chalk.cyanBright(name)} (${client.sessionId})`)
    delete this._users[client.sessionId]
    this.broadcastUsers()
  }

  onMessage(client: Client, data) {
    // this.broadcast(this.clients)
  }
}
