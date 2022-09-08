import { MsgExecuteContract, Wallet } from '@terra-money/terra.js'
import { Asset, SwapOperation } from '../types/astroport.js'

export default function performDcaPurchase(
  wallet: Wallet,
  orderId: number,
  address: string,
  hops: SwapOperation[],
  feeRedeem: Asset[],
) {
  const executeMsg = new MsgExecuteContract(
    wallet.key.accAddress,
    process.env.ASTROPORT_DCA as string,
    {
      perform_dca_purchase: {
        id: orderId,
        user: address,
        hops: hops,
        fee_redeem: feeRedeem,
      },
    },
  )

  return [executeMsg]
}
