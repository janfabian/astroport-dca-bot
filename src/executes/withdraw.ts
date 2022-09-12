import { MsgExecuteContract, Wallet } from '@terra-money/terra.js'
import { isNativeToken } from '../lib.js'
import { Asset } from '../types/astroport.js'

export default function withdraw(wallet: Wallet, assets: Asset[]) {
  const allowanceMsgs = assets
    .filter((a) => !isNativeToken(a.info))
    .map((a) => {
      const contractAddr = a.info.token?.contract_addr

      if (!contractAddr) {
        return
      }

      return new MsgExecuteContract(wallet.key.accAddress, contractAddr, {
        decrease_allowance: {
          spender: process.env.ASTROPORT_DCA,
          amount: a.amount,
        },
      })
    })
    .filter(Boolean)

  const executeMsg = new MsgExecuteContract(
    wallet.key.accAddress,
    process.env.ASTROPORT_DCA as string,
    {
      withdraw: {
        assets: assets,
      },
    },
  )

  return [...allowanceMsgs, executeMsg] as MsgExecuteContract[]
}
