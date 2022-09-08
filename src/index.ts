import 'dotenv/config'

import { Command } from 'commander'
import addAddressCommand from './commands/add-address.js'
import createDcaOrderCommand from './commands/create-dca-order.js'
import listOrdersCommand from './commands/list-orders.js'
import watchCommand from './commands/watch.js'

const program = new Command()

program
  .name('astroport-dca-bot')
  .description('CLI to manage and watch astroport-dca orders')
  .version('0.9.0')

addAddressCommand(program)
createDcaOrderCommand(program)
listOrdersCommand(program)
watchCommand(program)

program.parse()
