import 'dotenv/config'

import { Command } from 'commander'
import addAddressCommand from './commands/add-address.js'
import createDcaOrderCommand from './commands/create-dca-order.js'
import listOrdersCommand from './commands/list-orders.js'
import watchCommand from './commands/watch.js'
import getConfigCommand from './commands/get-config.js'
import getUserConfigCommand from './commands/get-user-config.js'
import addBotTipCommand from './commands/add-bot-tip.js'
import updateUserConfigCommand from './commands/update-user-config.js'
import withdrawCommand from './commands/withdraw.js'

const program = new Command()

program
  .name('astroport-dca-bot')
  .description('CLI to manage and watch astroport-dca orders')
  .version('0.9.0')

addAddressCommand(program)
addBotTipCommand(program)
createDcaOrderCommand(program)
getConfigCommand(program)
getUserConfigCommand(program)
listOrdersCommand(program)
updateUserConfigCommand(program)
watchCommand(program)
withdrawCommand(program)

program.parse()
