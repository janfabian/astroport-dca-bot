import { Command, InvalidOptionArgumentError } from 'commander'
import { tryCatch } from '../lib.js'
import { getKey, getLCDClient } from '../terra.js'
import cancelDcaOrderExecute from '../executes/cancel-dca-order.js'
import getUserDcaOrders from '../queries/get-user-dca-orders.js'
import { DcaQueryInfo } from '../types/astroport.js'
import { myParseInt } from './lib.js'
import { MsgExecuteContract } from '@terra-money/terra.js'
import { addAddress } from './add-address.js'

export async function cancelDcaOrder(options) {
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

  const msgs: MsgExecuteContract[] = cancelDcaOrderExecute(
    wallet,
    originalOrder,
  )

  const executeTx = await wallet.createAndSignTx({
    msgs: msgs,
  })

  const executeTxResult = await terra.tx.broadcast(executeTx)

  await addAddress(address, {})

  return executeTxResult
}

export default function cancelDcaOrderCommand(program: Command) {
  program
    .command('cancel-dca-order')
    .description('Cancels DCA order and withdraw funds')
    .requiredOption('-id, --order-id <number>', 'order id', myParseInt)
    .action(tryCatch(cancelDcaOrder))
}
