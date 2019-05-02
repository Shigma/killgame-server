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
}

interface ClientAuth {}

export default class extends Room<any> {
  maxClients = 12
  name: string

  onInit (options: RoomOptions = {}) {
    console.log("CREATING NEW ROOM")
    this.setState(new State())
    this.name = options.name
    this.setMetadata({
      name: this.name,
    })
  }

  onJoin (client: Client, options: RoomOptions = {}, auth: ClientAuth) {
    console.log("JOINING ROOM")
  }

  requestJoin (options: RoomOptions = {}, isNewRoom: boolean) {
    return options.create
      ? options.create && isNewRoom
      : this.clients.length > 0
  }

  onMessage (client: Client, message: any) {
    console.log('message', message)
  }

  onLeave (client: Client) {
    console.log("ChatRoom:", client.sessionId, "left!")
  }
}
