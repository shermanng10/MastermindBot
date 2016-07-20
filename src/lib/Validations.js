let validGuessColors = ["red", "blue", "green", "yellow", "purple", "teal"]
let validKeyColors = ["black", "white"]

function _validateRowLength(rowArray, length){ 
	return rowArray.length === length
}

function _validateRowColors(rowArray, colorArray){
	for (let i = 0; i < rowArray.length; i++){
		if (!(colorArray.indexOf(rowArray[i]) > -1)){
			return false
		}
	}
	return true
}

function _validateKeyRowLength(rowArray){ 
	return rowArray.length <= 4
}

function guessValidator(rowArray){
	return (_validateRowLength(rowArray, 4) && _validateRowColors(rowArray, validGuessColors))
}

function validateGuessRowsLength(guessRowsArray){
	return guessRowsArray.length <= 12
}

function validateKeyRow(keyArray){
	return (_validateKeyRowLength(keyArray) && _validateRowColors(keyArray, validKeyColors))
}

module.exports = { validGuessColors, guessValidator, validateGuessRowsLength, validateKeyRow }