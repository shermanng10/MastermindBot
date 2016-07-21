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
  	this.postMessage(message.channel, response, {as_user: true})
  }

  _welcomeMessage() {
    this.postMessageToChannel(this.channels[0].name, "Hi, I'm a bot that you can play classic Mastermind against! Type '@mastermind help' to learn how to play.", {as_user: true})
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

bot.run()