import { Command } from 'commander'
import { write } from '../db.js'
import { tryCatch } from '../lib.js'
import getUserDcaOrders from '../queries/get-user-dca-orders.js'
import { getKey, getLCDClient } from '../terra.js'
import { DcaQueryInfo } from '../types/astroport.js'
import { User } from '../types/db.js'

export async function addAddress(address, options) {
  const k = getKey()
  const terra = await getLCDClient()
  const wallet = terra.wallet(k)

  address = address ?? wallet.key.accAddress

  const result: DcaQueryInfo[] = await terra.wasm.contractQuery(
    process.env.ASTROPORT_DCA as string,
    getUserDcaOrders(address),
  )

  let orderIds = result.map((dca) => dca.order.id)

  if (options.orderIds) {
    orderIds = orderIds.filter((id) => options.orderIds.includes(id))
  }

  const user: User = {
    address,
    orderIds: orderIds,
  }

  write(user)
}

export default function addAddressCommand(program: Command) {
  program
    .command('add-address')
    .description(
      'Add address to user DB, watch all of users orders unless order ids explicitly provided',
    )
    .argument('[string]', 'address')
    .option('-o, --order-ids <numbers...>', 'order ids')
    .action(tryCatch(addAddress))
}
