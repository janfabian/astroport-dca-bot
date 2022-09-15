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
  swapOpsFromPath,
} from '../lib.js'
import { myParseInt } from './lib.js'
import { list } from '../db.js'
import { getDcaOrders } from './get-dca-orders.js'
import { getPairs, simulateSwap } from '../astroport.js'
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

export async function watchIteration(options) {
  const pairs = await getPairs()
  const graph = createGraph(pairs)
  const nativeTokens = getNativeTokens(pairs)

  const config = await getConfig()

  const adresses = list()
  if (adresses.length === 0) {
    console.warn('Watching addresses empty.')
  }

  for (const address of adresses) {
    const whitelistedFees = fromAssetListToMap(config.whitelisted_fee_assets)
    const whiteListedDenoms = new Set(config.whitelisted_tokens.map(getDenom))

    let orders = await getDcaOrders(address.address)

    orders = orders
      .filter((o) => address.orderIds?.includes(o.order.id))
      .filter(
        (o) =>
          o.order.last_purchase + o.order.interval <
          Math.ceil(Date.now() / 1000),
      )

    console.log(
      `[Address: ${address.address}:`,
      `Number of purchasable orders ${orders.length}`,
    )

    for (const order of orders) {
      const userConfig = await getUserConfig(address.address)
      const maxHops = userConfig.max_hops ?? config.max_hops
      const tipBalance = fromAssetListToMap(userConfig.tip_balance)

      const initialDenom = getDenom(order.order.initial_asset.info)
      const targetDenom = getDenom(order.order.target_asset)

      let bestOffer: {
        amount: bigint
        swapOps?: SwapOperation[]
        feeRedeem?: Asset[]
      } = { amount: 0n }

      const paths = [
        ...findPaths(
          graph,
          initialDenom,
          targetDenom,
          maxHops,
          whiteListedDenoms,
        ),
      ]

      console.log(
        `[Address: ${address.address}, orderId: ${order.order.id}]:`,
        `Simulating ${paths.length} possible routes from ${initialDenom} to ${targetDenom}`,
      )

      for (const path of paths) {
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

      if (options.simulate) {
        console.log(
          `[Address: ${address.address}, orderId: ${order.order.id}]: dca purchase result:`,
          inspect(bestOffer, false, null),
        )
      }

      if (bestOffer.swapOps && bestOffer.feeRedeem) {
        try {
          if (!options.simulate) {
            const result = await performDcaPurchase(
              order.order.id,
              address.address,
              bestOffer.swapOps,
              bestOffer.feeRedeem,
            )

            console.log(
              `[Address: ${address.address}, orderId: ${order.order.id}]: dca purchase tx:`,
              result.txhash,
            )
          }
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
}

export async function watch(options) {
  ;(async function iterate() {
    await watchIteration(options)

    setTimeout(iterate, options.interval)
  })()
}

export default function watchCommand(program: Command) {
  program
    .command('watch')
    .alias('start')
    .description('Watch orders and perform dca purchases')
    .option<number>(
      '-i, --interval <numbers>',
      'interval between each check in ms',
      myParseInt,
      5000,
    )
    .option(
      '-s, --simulate',
      'perform only simulation without actual DCA purchase',
    )
    .action(tryCatch(watch))
}
