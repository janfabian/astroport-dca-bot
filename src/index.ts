import 'dotenv/config'
import { inspect } from 'util'

import { getPairs } from './astroport.js'
import { createGraph, findPaths } from './lib.js'

const pairs = await getPairs()

console.log(inspect(pairs, false, null))

const graph = createGraph(pairs)

for (const path of findPaths(
  graph,
  'terra1jpwgvk8dd7mv5yqm8n84jd548qf95qkluvrnfs3en9kl3j2dauuq464k0q',
  'terra1zldxw0acfqy6yz2ugyrpypyjngexdms2l7frwcfvfzw4udx9xq5s7nmzxg',
  32,
  new Set(),
)) {
}
