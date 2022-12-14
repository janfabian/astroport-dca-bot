#!/usr/bin/env node
import 'dotenv/config'

import { Command } from 'commander'
import addAddressCommand from './commands/add-address.js'
import createDcaOrderCommand from './commands/create-dca-order.js'
import getDcaOrdersCommand from './commands/get-dca-orders.js'
import watchCommand from './commands/watch.js'
import getConfigCommand from './commands/get-config.js'
import getUserConfigCommand from './commands/get-user-config.js'
import addBotTipCommand from './commands/add-bot-tip.js'
import updateUserConfigCommand from './commands/update-user-config.js'
import withdrawCommand from './commands/withdraw.js'
import cancelDcaOrderCommand from './commands/cancel-dca-order.js'
import modifyDcaOrderCommand from './commands/modify-dca-order.js'
import getPairsCommand from './commands/get-pairs.js'

const program = new Command()

program
  .name('astroport-dca-bot')
  .description('CLI to manage and watch astroport-dca orders')
  .version('0.9.0')

addAddressCommand(program)
addBotTipCommand(program)
cancelDcaOrderCommand(program)
createDcaOrderCommand(program)
getConfigCommand(program)
getPairsCommand(program)
getUserConfigCommand(program)
getDcaOrdersCommand(program)
modifyDcaOrderCommand(program)
updateUserConfigCommand(program)
watchCommand(program)
withdrawCommand(program)

program.parse()
