import { Command, InvalidOptionArgumentError } from 'commander'
import { getNativeTokens, nativeToken, token, tryCatch } from '../lib.js'
import { getKey, getLCDClient } from '../terra.js'
import modifyDcaOrderExecute from '../executes/modify-dca-order.js'
import getUserDcaOrders from '../queries/get-user-dca-orders.js'
import { DcaQueryInfo } from '../types/astroport.js'
import { myParseInt, parseInitialAsset } from './lib.js'
import { addAddress } from './add-address.js'
import { getPairs } from '../astroport.js'

export async function modifyDcaOrder(options) {
  const k = getKey()
  const terra = await getLCDClient()
  const wallet = terra.wallet(k)
  const address = wallet.key.accAddress

  const orders: DcaQueryInfo[] = await terra.wasm.contractQuery(
    process.env.ASTROPORT_DCA as string,
    getUserDcaOrders(wallet.key.accAddress),
  )

  const originalOrder = orders.find((o) => o.order.id === options.orderId)

  if (!originalOrder) {
    throw new InvalidOptionArgumentError(
      'Nonexisting order id, ' + options.orderId,
    )
  }

  const pairs = await getPairs()
  const nativeTokens = getNativeTokens(pairs)

  const initial: string[] = options.initial
  let initialAmount: string | null = null
  let initialDenom: string | null = null

  if (initial) {
    ;[initialAmount, initialDenom] = parseInitialAsset(initial) || []
  }

  const target = options.target

  const msgs = modifyDcaOrderExecute(
    wallet,
    originalOrder.order,
    initialAmount && initialDenom
      ? {
          info: nativeTokens.has(initialDenom)
            ? nativeToken(initialDenom)
            : token(initialDenom),
          amount: initialAmount,
        }
      : undefined,
    target && (nativeTokens.has(target) ? nativeToken(target) : token(target)),
    options.interval,
    options.dcaAmount,
    options.first,
  )

  const executeTx = await wallet.createAndSignTx({
    msgs: msgs,
  })

  const executeTxResult = await terra.tx.broadcast(executeTx)

  await addAddress(address, {})

  return executeTxResult
}

export default function modifyDcaOrderCommand(program: Command) {
  program
    .command('modify-dca-order')
    .description('Modifies DCA order')
    .requiredOption('-id, --order-id <number>', 'order id', myParseInt)
    .option(
      '-i, --initial [string...]',
      'new initial asset info, ex. 100 uluna',
    )
    .option('-t, --target [string]', 'new target asset denom')
    .option(
      '-n, --interval [number]',
      'new minimal interval between purchases in seconds',
      myParseInt,
    )
    .option('-a, --dca-amount [string]', 'dca amount')
    .option(
      '-f, --first [number]',
      'new first dca purchase possible after seconds',
      myParseInt,
    )
    .action(tryCatch(modifyDcaOrder))
}
