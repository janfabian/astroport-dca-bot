import { Command } from 'commander'
import { tryCatch } from '../lib.js'
import getUserConfigQuery from '../queries/get-user-config.js'
import { getKey, getLCDClient } from '../terra.js'
import { UserConfigQuery } from '../types/astroport.js'

export async function getUserConfig(
  address?: string,
): Promise<UserConfigQuery> {
  const k = getKey()
  const terra = await getLCDClient()
  const wallet = terra.wallet(k)

  const result: UserConfigQuery = await terra.wasm.contractQuery(
    process.env.ASTROPORT_DCA as string,
    getUserConfigQuery(address || wallet.key.accAddress),
  )

  return result
}

export default function getUserConfigCommand(program: Command) {
  program
    .command('get-user-config')
    .description('Get address specific config')
    .argument('[string]', 'address')
    .action(tryCatch(getUserConfig))
}
