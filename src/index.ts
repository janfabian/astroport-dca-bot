import 'dotenv/config'
import { getPairs } from './astroport.js'

const pairs = await getPairs()

console.log(pairs)
