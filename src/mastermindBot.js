import path from 'path'
import Bot from 'slackbots'
import db from './database/db'
import mongoose from 'mongoose'
import config from '../config'
import { guessValidator } from './lib/Validations'
import { User } from './models/User'
import { Mastermind } from './models/Mastermind'

class MastermindBot extends Bot {
	constructor(settings) {
		super(settings)
		this.settings = settings
		this.settings.name = this.settings.name || 'mastermindBot'
	}

	_loadBotUser() {
		this.user = this.users.filter((user) => {
			return user.name === this.name
		})[0]
	}

	_getChannelNameById(channelId) {
	    return this.channels.filter((item) => {
	        return item.id === channelId;
	    })[0].name
	}

	_getUserNameById(userId) {
	    return this.users.filter((item) => {
	        return item.id === userId;
	    })[0].name
	}

	_getGroupNameById(groupId) {
		return this.groups.filter((item) => {
			return item.id === groupId;
		})[0].name
	}

	_findOrCreateUser(userId) {
		return User.findOneAndUpdate({userId: userId}, {}, { upsert:true, new: true})
	}

	_handleGuess(text, user) {
		let guessArray = text.match(/\bblue|\bred|\bgreen|\byellow|\bteal|\bpurple/g)
		if (guessArray){
			if (guessValidator(guessArray)){
				return user.game.checkVictory(guessArray)
			}		
		} 
		return "Invalid guess, format for guessing should be: '@mastermind guess color color color color', *valid colors are Blue, Green, Red, Yellow, Teal, Purple*'"
	}
	

	_checkMessage(message) {
		let text = message.text.toLowerCase()
		let userId = message.user
		let response;
		this._findOrCreateUser(userId).then((user) => {
			if (text.indexOf('guess') > -1){
				response = this._handleGuess(text, user)
			} else if (text.indexOf('new game') > -1) {
				user.game = new Mastermind()
				response =  "New game has been started."
			} else if (text.indexOf('help') > -1) {
				response = `*How to win:* I hold a four color code that you must guess within eight turns in order to be victorious. Upon a guess, I will return your guess, along with a key row of either black, white, or empty pegs signifying a correct color in a correct position, a correct color in an incorrect position, or no match respectively. \n *To make a guess:* enter '@mastermind guess' and the four colors that you think are part of the correct code, _valid colors are Blue, Green, Red, Yellow, Teal, Purple_, colors can be duplicated! \n *To start a new game:* enter '@mastermind new game'`
			} else {
				response = "Command not understood. You can either guess, start a new game, or get help by entering '@mastermind help'."
			}
			user.save((err, user) => { if (err) { console.log(err) }; this._respondToMessage(message, response) })
		})
	}

	_respondToMessage(message, response) {
		if (typeof message.channel === 'string' && message.channel[0] === 'C') {

			let channel = this._getChannelNameById(message.channel)
			this.postMessageToChannel(channel, response, {as_user: true})

		} else if (typeof message.channel === 'string' && message.channel[0] === 'G') {

			let groupChannel = this._getGroupNameById(message.channel)
			this.postMessageToGroup(groupChannel, response, {as_user: true})

		} else if (typeof message.channel === 'string' && message.channel[0] === 'D') {

			let user = this._getUserNameById(message.user)
			this.postMessageToUser(user, response, {as_user: true})

		}
	}

	_welcomeMessage() {
		this.postMessageToUser('sherman', "Hi, I'm a bot that you can play mastermind against! Type '@mastermind help' to learn how to play.")
	}

	_isChatMessage(message) {
		return message.type === 'message' && Boolean(message.text)
	}

	_isFromMastermindBot(message) {
    	return message.user === this.user.id;
	}

	_isMentioningMastermindBot(message) {
	    return message.text.indexOf(`<@${this.user.id}>`) > -1
	}

	_onMessage(message) {
		if (this._isChatMessage(message) &&
			!this._isFromMastermindBot(message) &&
			this._isMentioningMastermindBot(message)
		) {
			this._checkMessage(message)	
		}
	}

	_onStart() {
		this._loadBotUser()
		this._welcomeMessage()
	}

	run() {
		this.on('start', this._onStart)
		this.on('message', this._onMessage)
	}
}

let settings = {
	token: config['SLACK_API_TOKEN'],
	name: 'mastermind'
}

let bot = new MastermindBot(settings)

// bot.on('start', function() {
//     // more information about additional params https://api.slack.com/methods/chat.postMessage
//     var params = {
//         icon_emoji: ':pokemon-blastoise:'
//     };

//     // define channel, where bot exist. You can adjust it there https://my.slack.com/services 

//     // define existing username instead of 'user_name'
//     bot.postMessageToUser('jdibiccari', 'be careful, shaun has an ear open', params); 

//     // define private group instead of 'private_group', where bot exist
// });

// console.log(bot)
bot.run()