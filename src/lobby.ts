import { Room, Client } from 'colyseus'
import { getTimeInfo } from './utils'
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
        clients: room.clients.map(client => client.id),
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

  createRoom (room: GameRoom) {
    this._rooms[room.roomId] = room
    console.log(`${getTimeInfo()} room create: ${room.info}`)
    this.broadcastRooms()
  }

  removeRoom (room: GameRoom) {
    delete this._rooms[room.roomId]
    console.log(`${getTimeInfo()} room remove: ${room.info}`)
    this.broadcastRooms()
  }

  onInit (options) {
    lobby = this
    console.log(chalk.yellowBright('Lobby initialized.'))
  }

  userInfo (client: Client) {
    const { name } = this._users[client.id]
    return chalk`{cyanBright ${name}} {gray (${client.id})}`
  }

  onJoin (client: Client, options: UserOptions, auth) {
    const { name } = options
    this._users[client.id] = { name }
    console.log(`${getTimeInfo()} client join: ${this.userInfo(client)}`)
    this.broadcastRooms()
    this.broadcastUsers()
  }

  onLeave (client: Client, consented: boolean) {
    console.log(`${getTimeInfo()} client leave: ${this.userInfo(client)}`)
    delete this._users[client.id]
    this.broadcastUsers()
  }

  onMessage(client: Client, data) {
    // this.broadcast(this.clients)
  }
}
