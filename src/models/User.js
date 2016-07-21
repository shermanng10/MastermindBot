import mongoose from 'mongoose'
import { MastermindSchema } from './Mastermind'

const userSchema = mongoose.Schema({
  userId: { type: String, required: true} ,
  game: {type: MastermindSchema, default: MastermindSchema}
})

const User = mongoose.model('User', userSchema)

module.exports = { User }

