import { Command } from 'commander'
import { tryCatch } from '../lib.js'
import getUserDcaOrders from '../queries/get-user-dca-orders.js'
import { getKey, getLCDClient } from '../terra.js'
import { DcaQueryInfo } from '../types/astroport.js'

export async function getDcaOrders(address?: string): Promise<DcaQueryInfo[]> {
  const k = getKey()
  const terra = await getLCDClient()
  const wallet = terra.wallet(k)

  const result: DcaQueryInfo[] = await terra.wasm.contractQuery(
    process.env.ASTROPORT_DCA as string,
    getUserDcaOrders(address || wallet.key.accAddress),
  )

  return result
}

export default function getDcaOrdersCommand(program: Command) {
  program
    .command('get-dca-orders')
    .description('List orders for given address')
    .argument('[string]', 'address')
    .action(tryCatch(getDcaOrders))
}
