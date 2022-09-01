import { MsgExecuteContract, Wallet } from '@terra-money/terra.js'

export default function cancelDcaOrder(wallet: Wallet, id: number) {
  const executeMsg = new MsgExecuteContract(
    wallet.key.accAddress,
    process.env.ASTROPORT_DCA as string,
    {
      cancel_dca_order: {
        id: id,
      },
    },
  )

  return [executeMsg]
}
