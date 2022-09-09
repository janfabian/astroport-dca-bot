import { Coin, MsgExecuteContract, MsgSend } from '@terra-money/terra.js'
import 'dotenv/config'
import { inspect } from 'util'

import { getPairs, simulateSwap } from './astroport.js'
import addBotTip from './executes/add-bot-tip.js'
import createDcaOrder from './executes/create-dca-order.js'
import { createGraph, findPaths, getNativeTokens } from './lib.js'
import getConfig from './queries/get-config.js'
import getUserConfig from './queries/get-user-config.js'
import getUserDcaOrders from './queries/get-user-dca-orders.js'
import { getKey, getLCDClient } from './terra.js'

const k = getKey()
const terra = await getLCDClient()
const wallet = terra.wallet(k)

// const result2 = await terra.wasm.contractQuery(
//   process.env.ASTROPORT_DCA as string,
//   getUserConfig(wallet.key.accAddress),
// )

// const result = await terra.wasm.contractQuery(
//   process.env.ASTROPORT_DCA as string,
//   getConfig(),
// )

// console.log(inspect(result2, false, null))

// const send = new MsgSend(
//   k.publicKey?.address() as string,
//   k.publicKey?.address() as string,
//   {
//     uluna: 1000,
//   },
// )

// wallet
//   .createAndSignTx({
//     msgs: [send],
//     memo: 'test from terra.js!',
//   })
//   .then((tx) => terra.tx.broadcast(tx))
//   .then((result) => {
//     console.log(`TX hash: ${result.txhash}`)
//   })

// const msgs = addBotTip(wallet, [
//   // {
//   //   info: {
//   //     token: {
//   //       contract_addr:
//   //         'terra167dsqkh2alurx997wmycw9ydkyu54gyswe3ygmrs4lwume3vmwks8ruqnv',
//   //     },
//   //   },
//   //   amount: '12',
//   // },
//   {
//     info: {
//       native_token: {
//         denom: 'uluna',
//       },
//     },
//     amount: '1',
//   },
// ])

// const executeTx = await wallet.createAndSignTx({
//   msgs: msgs,
// })

// const executeTxResult = await terra.tx.broadcast(executeTx)

// console.log(executeTxResult)

// const msgs = createDcaOrder(
//   wallet,
//   {
//     info: {
//       native_token: {
//         denom: 'uluna',
//       },
//     },
//     amount: '100',
//   },
//   {
//     token: {
//       contract_addr:
//         'terra167dsqkh2alurx997wmycw9ydkyu54gyswe3ygmrs4lwume3vmwks8ruqnv',
//     },
//   },
//   10,
//   '10',
// )

// const executeTx = await wallet.createAndSignTx({
//   msgs: msgs,
// })

// const executeTxResult = await terra.tx.broadcast(executeTx)

// console.log(executeTxResult)

const pairs = await getPairs()

// console.log(inspect(pairs, false, null))

const graph = createGraph(pairs)
const nativeTokens = getNativeTokens(pairs)

// console.log(inspect(graph, false, null))

for (const path of findPaths(
  graph,
  'uluna',
  'ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4',
  32,
  new Set(),
)) {
  console.log({ path })
  const result = await simulateSwap('2000000000', path, nativeTokens)

  console.log({ result })
}
