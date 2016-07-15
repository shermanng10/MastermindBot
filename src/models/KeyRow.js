import mongoose from 'mongoose'
import { validateKeyRow } from '../lib/Validations'

const KeyRowSchema = mongoose.Schema({
	keyRow: { type: Array, 
		   	  validate: [validateKeyRow, 'Key row must 4 pegs long and contain only white or black.'] }},
		   	{ _id : false }
)

module.exports = { KeyRowSchema } 
