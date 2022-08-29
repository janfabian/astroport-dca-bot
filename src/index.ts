import 'dotenv/config'

import { getPairs } from './astroport.js'
import { createGraph } from './lib.js'

const pairs = await getPairs()
const graph = createGraph(pairs)
