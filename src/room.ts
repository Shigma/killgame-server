import chalk from 'chalk'
import { lobby } from './lobby'
import { getTimeInfo } from './utils'
import { Room, Client } from 'colyseus'
import { Schema, type, MapSchema } from "@colyseus/schema"

export class Player extends Schema {
  @type('boolean')
  alive = true
}

export class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>()

  createPlayer (id: string) {
    this.players[id] = new Player()
  }

  removePlayer (id: string) {
    delete this.players[id]
  }
}

interface RoomOptions {
  create?: boolean
  name?: string
  userId?: string
  maxClients?: number
  passwordHash?: string
}

interface ClientAuth {}

export default class extends Room<any> {
  maxClients = 12
  options: RoomOptions
  lobby = lobby

  onInit (options: RoomOptions = {}) {
    this.setState(new State())
    this.options = options
    lobby.createRoom(this)
  }

  onJoin (client: Client, options: RoomOptions = {}, auth: ClientAuth) {
    console.log(`${getTimeInfo()} client ${this.lobby.userInfo(client)} joined room ${this.info}.`)
    this.lobby.broadcastRooms()
  }

  onLeave (client: Client) {
    console.log(`${getTimeInfo()} client ${this.lobby.userInfo(client)} left room ${this.info}.`)
    this.lobby.broadcastRooms()
  }

  get info () {
    return chalk`{greenBright ${this.options.name}} {gray (${this.roomId})}`
  }

  requestJoin (options: RoomOptions, isNewRoom: boolean) {
    if (!lobby || !options.userId) return false
    if (options.create) return !!options.name && isNewRoom
    return this.clients.length > 0 && this.clients.every(client => client.id !== options.userId)
  }

  onMessage (client: Client, message: any) {
    console.log('message', message)
  }

  onDispose() {
    lobby.removeRoom(this)
  }
}
