function numSameElements(array1, array2){
	let num = 0
	let tempArray = array2.slice()
	for (let i = 0; i < array1.length; i++){
		let index = tempArray.indexOf(array1[i])
		if (index > -1){
			tempArray.splice(index, 1)
			num ++
		}
	}
	return num
}

function numElementsInSamePosition(array1, array2){
	let num = 0
	for (let i = 0; i < array1.length; i++){
		if (array1[i] == array2[i]){
			num++
		}
	}
	return num
}

module.exports = {numSameElements, numElementsInSamePosition}