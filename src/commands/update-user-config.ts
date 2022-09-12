import { Command } from 'commander'
import updateUserConfigExecute from '../executes/update-user-config.js'
import { tryCatch } from '../lib.js'
import getUserConfigQuery from '../queries/get-user-config.js'
import { getKey, getLCDClient } from '../terra.js'
import { UserConfigQuery } from '../types/astroport.js'

export async function getUserConfig(options) {
  const k = getKey()
  const terra = await getLCDClient()
  const wallet = terra.wallet(k)

  const originalUserConfig: UserConfigQuery = await terra.wasm.contractQuery(
    process.env.ASTROPORT_DCA as string,
    getUserConfigQuery(wallet.key.accAddress),
  )

  const msgs = updateUserConfigExecute(
    wallet,
    originalUserConfig,
    options.maxHops,
    options.maxSpread,
  )

  const executeTx = await wallet.createAndSignTx({
    msgs: msgs,
  })

  const executeTxResult = await terra.tx.broadcast(executeTx)

  return executeTxResult
}

export default function updateUserConfigCommand(program: Command) {
  program
    .command('update-user-config')
    .description('Updates address specific config')
    .option('-s, --max-spread <number>', 'max spread')
    .option('-s, --max-hops <string>', 'max spread')
    .action(tryCatch(getUserConfig))
}
