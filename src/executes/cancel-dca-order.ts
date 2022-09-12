import { MsgExecuteContract, Wallet } from '@terra-money/terra.js'
import { isNativeToken } from '../lib.js'
import { DcaQueryInfo } from '../types/astroport.js'

export default function cancelDcaOrder(
  wallet: Wallet,
  originalOrder: DcaQueryInfo,
) {
  const orderId = originalOrder.order.id
  const msgs: MsgExecuteContract[] = []

  if (!isNativeToken(originalOrder.order.initial_asset.info)) {
    const decreaseAllowanceMsg = new MsgExecuteContract(
      wallet.key.accAddress,
      originalOrder.order.initial_asset.info.token?.contract_addr as string,
      {
        decrease_allowance: {
          spender: process.env.ASTROPORT_DCA,
          amount: originalOrder.order.initial_asset.amount,
        },
      },
    )

    msgs.push(decreaseAllowanceMsg)
  }

  const executeMsg = new MsgExecuteContract(
    wallet.key.accAddress,
    process.env.ASTROPORT_DCA as string,
    {
      cancel_dca_order: {
        id: orderId,
      },
    },
  )

  msgs.push(executeMsg)

  return msgs
}
