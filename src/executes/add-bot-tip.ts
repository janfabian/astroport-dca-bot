import { MsgExecuteContract, Wallet } from '@terra-money/terra.js'
import { isNativeToken } from '../lib.js'
import { Asset } from '../types/astroport.js'

export default function addBotTip(wallet: Wallet, assets: Asset[]) {
  const allowanceMsgs = assets
    .filter((a) => !isNativeToken(a.info))
    .map((a) => {
      const contractAddr = a.info.token?.contract_addr

      if (!contractAddr) {
        return
      }

      return new MsgExecuteContract(wallet.key.accAddress, contractAddr, {
        increase_allowance: {
          spender: process.env.ASTROPORT_DCA,
          amount: a.amount,
        },
      })
    })
    .filter(Boolean)

  const nativeAssets = assets
    .filter((a) => isNativeToken(a.info))
    .reduce((acc, asset) => {
      const denom = asset.info.native_token?.denom

      if (!denom) {
        return acc
      }

      return { ...acc, [denom]: asset.amount }
    }, {})

  const executeMsg = new MsgExecuteContract(
    wallet.key.accAddress,
    process.env.ASTROPORT_DCA as string,
    {
      add_bot_tip: {
        assets: assets,
      },
    },
    nativeAssets,
  )

  return [...allowanceMsgs, executeMsg] as MsgExecuteContract[]
}
