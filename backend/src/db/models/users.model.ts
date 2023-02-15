import * as bcrypt from 'bcrypt'
import { model, Schema, Types } from 'mongoose'

/* export const USER_POPULATE_PUBLIC = [
  '-email',
  'password',
  '__v',
  'payment',
  'identity.firstName',
  'identity.lastName',
].join(' -') */

export interface IUser {
  _id: Types.ObjectId

  username: string
  email: string
  password: string

  verifyPassword(password: string): boolean
  clean(): ICleanedUser
}

export type ICleanedUser = Omit<IUser, 'password' | 'verifyPassword' | 'clean'>

const usersSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },

  created: {
    type: Date,
    default: Date.now,
  },
})

usersSchema.pre('save', async function (next) {
  if (this.password && !this.password.startsWith('$2b$10$'))
    this.password = bcrypt.hashSync(this.password, 10)
  next()
})

usersSchema.methods.verifyPassword = function (password: string): boolean {
  return bcrypt.compareSync(password, this.password)
}

usersSchema.methods.clean = function (): ICleanedUser {
  let buffer: IUser = { ...this }
  delete buffer.password
  delete buffer.verifyPassword
  delete buffer.clean
  return buffer
}

export const Users = model<IUser>('Users', usersSchema)
