import { MsgExecuteContract, Wallet } from '@terra-money/terra.js'
import { UserConfigQuery } from '../types/astroport.js'

export default function updateUserConfig(
  wallet: Wallet,
  originalUserConfig: UserConfigQuery,
  newMaxHops?: number,
  newMaxSpread?: string,
) {
  newMaxHops = newMaxHops ?? originalUserConfig.max_hops
  newMaxSpread = newMaxSpread ?? originalUserConfig.max_spread

  const executeMsg = new MsgExecuteContract(
    wallet.key.accAddress,
    process.env.ASTROPORT_DCA as string,
    {
      update_user_config: {
        max_hops: newMaxHops,
        max_spread: newMaxSpread,
      },
    },
  )

  return [executeMsg]
}
