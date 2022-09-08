import { Command } from 'commander'
import { tryCatch } from '../lib.js'
import getUserDcaOrders from '../queries/get-user-dca-orders.js'
import { getKey, getLCDClient } from '../terra.js'

export async function listOrders(address?: string) {
  const k = getKey()
  const terra = await getLCDClient()
  const wallet = terra.wallet(k)

  const result = await terra.wasm.contractQuery(
    process.env.ASTROPORT_DCA as string,
    getUserDcaOrders(address || wallet.key.accAddress),
  )

  console.log(JSON.stringify(result, null, 4))
}

export default function listOrdersCommand(program: Command) {
  program
    .command('list-orders')
    .description('List orders for given address')
    .argument('[string]', 'address')
    .action(tryCatch(listOrders))
}
