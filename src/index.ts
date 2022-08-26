import 'dotenv/config'
import { getLCDClient } from './terra.js'

const lcd = await getLCDClient()

const factory = process.env.ASTROPORT_FACTORY as string

console.log(await lcd.wasm.contractQuery(factory, { config: {} }))
