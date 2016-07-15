import mongoose from 'mongoose'
import { guessValidator } from '../lib/Validations'

const GuessRowSchema = mongoose.Schema({
	row: { type: Array, 
		   validate: [guessValidator, 'Guess must 4 pegs long and contain only red, blue, green, yellow, purple, or teal.'] }
		 },
		 { _id : false }
)

module.exports = { GuessRowSchema } 
