import mongoose from 'mongoose'
import { validColors, validateGuessRowsLength } from '../lib/Validations'
import {numElementsInSamePosition, numSameElements } from '../lib/HelperFunctions'
import { GuessRowSchema } from './GuessRow'
import { KeyRowSchema } from './KeyRow'

function _randomAnswerRow() {
	let row = []
	for (let i = 0; i < 4; i++) {
		let rand = Math.floor(Math.random() * 6)
		row.push(validColors[rand])
	}
	return row
}

const MastermindSchema = mongoose.Schema({
	answerRow: { type: Array , default: _randomAnswerRow } ,
	guessRows: [GuessRowSchema],
	keyRows: [KeyRowSchema],
	gameWon: { type: Boolean, default: false }}
)

MastermindSchema.path('guessRows').validate(validateGuessRowsLength, 'You can only guess a maximum of 12 times per game!')

MastermindSchema.methods._addGuess = function(guessRow){
	this.guessRows.push({row: guessRow})
}

MastermindSchema.methods._calculateKeyRow = function(guessRow){
	let keyRow = []
	let numBlackKey = numElementsInSamePosition(guessRow, this.answerRow)
	let numWhiteKey = (numSameElements(this.answerRow, guessRow) - numBlackKey)
	for (let i = 0; i < numBlackKey; i++){
		keyRow.push('black')
	}
	for (let i = 0; i < numWhiteKey; i++){
		keyRow.push('white')
	}
	return keyRow
}

MastermindSchema.methods._addKeyRow = function(keyRow){
	this.keyRows.push({keyRow: keyRow})
}

MastermindSchema.methods._checkGuessRow = function(guessRow){
	if (numElementsInSamePosition(guessRow, this.answerRow) == 4){
		return this.gameWon = true
	} else {
		return this._addKeyRow(this._calculateKeyRow(guessRow))
	}
}

MastermindSchema.methods.checkVictory = function(guessRow){
	if (this.gameWon == true){
		return "You've already won!"
	} else if (this.guessRows.length >= 12 && this.gameWon == false){
		return "You've guessed 12 times and lost!"
	} else if (this.guessRows.length <= 12 && this.gameWon == false){
		this._addGuess(guessRow)
		this._checkGuessRow(guessRow)
		return this.save(function(err){
			if (err) { console.log(err) }
		})
	}
}

module.exports = { MastermindSchema }