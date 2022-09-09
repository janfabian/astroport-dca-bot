import { Command } from 'commander'
import {
  createGraph,
  findPaths,
  getDenom,
  getNativeTokens,
  tryCatch,
} from '../lib.js'
import { myParseInt } from './lib.js'
import { list } from '../db.js'
import { listOrders } from './list-orders.js'
import { getPairs, simulateSwap } from '../astroport.js'

export async function watch(options) {
  const pairs = await getPairs()
  const graph = createGraph(pairs)
  const nativeTokens = getNativeTokens(pairs)

  ;(async function iterate() {
    const adresses = list()
    if (adresses.length === 0) {
      console.warn('Watching addresses empty.')
    }

    for (const address of adresses) {
      let orders = await listOrders(address.address)

      orders = orders.filter((o) => address.orderIds?.includes(o.order.id))

      for (const order of orders) {
        const initialDenom = getDenom(order.order.initial_asset.info)
        const targetDenom = getDenom(order.order.target_asset)

        for (const path of findPaths(
          graph,
          initialDenom,
          targetDenom,
          32,
          new Set(),
        )) {
          console.log({ path })
          try {
            const result = await simulateSwap(
              order.order.dca_amount,
              path,
              nativeTokens,
            )
            console.log({ result })
          } catch (e) {
            console.log('ERROR')
          }
        }
      }
    }

    setTimeout(iterate, options.interval)
  })()
}

export default function watchCommand(program: Command) {
  program
    .command('watch')
    .description('Watch orders and perform dca purchases')
    .option<number>(
      '-i, --interval <numbers>',
      'interval between each check in ms',
      myParseInt,
      5000,
    )
    .action(tryCatch(watch))
}
