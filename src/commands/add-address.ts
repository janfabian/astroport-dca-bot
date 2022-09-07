import { Command } from 'commander'
import { write } from '../db.js'
import getUserDcaOrders from '../queries/get-user-dca-orders.js'
import { getLCDClient } from '../terra.js'
import { User } from '../types/db.js'

export default function addAddress(program: Command) {
  program
    .command('add-address')
    .description(
      'Add address to user DB, watch all of users orders unless order ids explicitly provided',
    )
    .argument('<string>', 'address')
    .option('-o, --order-ids <numbers...>', 'order ids')
    .action(async (address, options) => {
      const terra = await getLCDClient()
      const result = await terra.wasm
        .contractQuery(
          process.env.ASTROPORT_DCA as string,
          getUserDcaOrders(address),
        )
        .catch((err) => console.error(err))

      const user: User = {
        address,
        orderIds: options.orderIds ?? [],
      }
      write(user)
    })
}
