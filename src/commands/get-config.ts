import { Command } from 'commander'
import { tryCatch } from '../lib.js'
import { getLCDClient } from '../terra.js'
import getConfigQuery from '../queries/get-config.js'
import { ConfigQuery } from '../types/astroport.js'

export async function getConfig(): Promise<ConfigQuery> {
  const terra = await getLCDClient()

  const result: ConfigQuery = await terra.wasm.contractQuery(
    process.env.ASTROPORT_DCA as string,
    getConfigQuery(),
  )

  return result
}

export default function getConfigCommand(program: Command) {
  program
    .command('get-config')
    .description('Get DCA contract config')
    .action(tryCatch(getConfig))
}
