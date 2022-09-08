import { Command } from 'commander'
import { tryCatch } from '../lib.js'
import { myParseInt } from './lib.js'

export async function watch(options) {
  ;(function iterate() {
    console.log('FOOOO')
    setTimeout(iterate, options.interval)
  })()
}

export default function watchCommand(program: Command) {
  program
    .command('watch')
    .description('Watch orders and perform dca purchases')
    .option<number>(
      '-i, --interval <numbers>',
      'interval between each check in ms',
      myParseInt,
      5000,
    )
    .action(tryCatch(watch))
}
