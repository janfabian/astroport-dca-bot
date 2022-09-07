import 'dotenv/config'

import { Command } from 'commander'
import addAddress from './commands/add-address.js'
const program = new Command()

program
  .name('astroport-dca-bot')
  .description('CLI to manage and watch astroport-dca orders')
  .version('0.9.0')

addAddress(program)

program.parse()
