import { Server, Socket } from 'socket.io'
import { Mongo } from '../../db/mongo'

export abstract class Hooks {
  authenticatedUserID

  constructor(io: Server, socket: Socket) {
    this.authenticatedUserID = Mongo.ObjectId(
      <string>socket.handshake.query.userId
    )
    this.bindHooks(io, socket)
  }

  abstract bindHooks(io: Server, socket: Socket)
}
