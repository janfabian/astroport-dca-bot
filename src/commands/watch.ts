import { Command } from 'commander'
import {
  createGraph,
  findPaths,
  fromAssetListToMap,
  getDenom,
  getNativeTokens,
  tryCatch,
  feeRedeem,
  fromMapToAssetList,
} from '../lib.js'
import { myParseInt } from './lib.js'
import { list } from '../db.js'
import { listOrders } from './list-orders.js'
import { getPairs, simulateSwap, swapOpsFromPath } from '../astroport.js'
import { getConfig } from './get-config.js'
import { getUserConfig } from './get-user-config.js'
import { inspect } from 'util'
import { Asset, SwapOperation } from '../types/astroport.js'
import performDcaPurchaseExecute from '../executes/perform-dca-purchase.js'
import { getKey, getLCDClient } from '../terra.js'

export async function performDcaPurchase(
  orderId: number,
  address: string,
  hops: SwapOperation[],
  feeRedeem: Asset[],
) {
  const k = getKey()
  const terra = await getLCDClient()
  const wallet = terra.wallet(k)

  const msgs = performDcaPurchaseExecute(
    wallet,
    orderId,
    address,
    hops,
    feeRedeem,
  )

  const executeTx = await wallet.createAndSignTx({
    msgs: msgs,
  })

  const executeTxResult = await terra.tx.broadcast(executeTx)

  return executeTxResult
}

export async function watch(options) {
  ;(async function iterate() {
    const pairs = await getPairs()
    const graph = createGraph(pairs)
    const nativeTokens = getNativeTokens(pairs)

    const config = await getConfig()

    const adresses = list()
    if (adresses.length === 0) {
      console.warn('Watching addresses empty.')
    }

    for (const address of adresses) {
      const userConfig = await getUserConfig(address.address)
      const maxHops = userConfig.max_hops ?? config.max_hops

      const whitelistedFees = fromAssetListToMap(config.whitelisted_fee_assets)
      const whiteListedDenoms = new Set(Object.keys(whitelistedFees))
      const tipBalance = fromAssetListToMap(userConfig.tip_balance)

      let orders = await listOrders(address.address)

      orders = orders
        .filter((o) => address.orderIds?.includes(o.order.id))
        .filter((o) => o.order.last_purchase <= Date.now() / 1000)

      for (const order of orders) {
        const initialDenom = getDenom(order.order.initial_asset.info)
        const targetDenom = getDenom(order.order.target_asset)

        let bestOffer: {
          amount: bigint
          swapOps?: SwapOperation[]
          feeRedeem?: Asset[]
        } = { amount: 0n }

        for (const path of findPaths(
          graph,
          initialDenom,
          targetDenom,
          maxHops,
          whiteListedDenoms,
        )) {
          try {
            const numOfHops = path.length - 1
            const fees = feeRedeem(whitelistedFees, tipBalance, numOfHops)

            if (fees == null) {
              console.warn(
                `[Address: ${address.address}, orderId: ${order.order.id}, hops: ${numOfHops}]:`,
                'Not enough fee funds, current tip balances:',
                inspect(tipBalance, false, null),
                'Required bot fees:',
                inspect(whitelistedFees, false, null),
              )

              continue
            }

            const result = await simulateSwap(
              order.order.dca_amount,
              path,
              nativeTokens,
            )

            if (result.amount) {
              const amountBigInt = BigInt(result.amount)
              if (amountBigInt > bestOffer.amount) {
                bestOffer = {
                  amount: amountBigInt,
                  swapOps: swapOpsFromPath(path, nativeTokens),
                  feeRedeem: fees
                    .map((f) => fromMapToAssetList(f, nativeTokens))
                    .flat(),
                }
              }
            }
          } catch (e) {
            console.error(
              `[Address: ${address.address}, orderId: ${order.order.id}]:`,
              'ERROR with path',
              path,
            )
          }
        }

        if (bestOffer.swapOps && bestOffer.feeRedeem) {
          try {
            const result = await performDcaPurchase(
              order.order.id,
              address.address,
              bestOffer.swapOps,
              bestOffer.feeRedeem,
            )

            console.log(
              `[Address: ${address.address}, orderId: ${order.order.id}]: dca purchase result:`,
              result,
            )
          } catch (e) {
            console.error(
              `[Address: ${address.address}, orderId: ${order.order.id}]: dca purchase error:`,
              e,
            )
          }
        } else {
          console.warn(
            `[Address: ${address.address}, orderId: ${order.order.id}]:`,
            'no path is suitable',
          )
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
