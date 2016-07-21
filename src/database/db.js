import mongoose from 'mongoose'
import {config} from './config'

mongoose.connect(config.db, {server:{socketOptions:{keepAlive:1}}})

let db = mongoose.connection

db.on('error', () => {
  throw new Error(`Unable to connect to the database: ${config.db}`)
})

db.once('open', () => {
  console.log(`Connected to ${config.db}`)
});

module.exports = { db }