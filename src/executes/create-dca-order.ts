import { MsgExecuteContract, Wallet } from '@terra-money/terra.js'
import { isNativeToken } from '../lib.js'
import { Asset, AssetInfo } from '../types/astroport.js'

export default function createDcaOrder(
  wallet: Wallet,
  initialAsset: Asset,
  targetAsset: AssetInfo,
  interval: number,
  dcaAmount: string,
  firstPurchase?: number,
) {
  if (isNativeToken(initialAsset.info)) {
    const denom = initialAsset.info.native_token?.denom

    if (!denom) {
      return []
    }

    const executeMsg = new MsgExecuteContract(
      wallet.key.accAddress,
      process.env.ASTROPORT_DCA as string,
      {
        create_dca_order: {
          initial_asset: initialAsset,
          target_asset: targetAsset,
          interval: interval,
          dca_amount: dcaAmount,
          first_purchase: firstPurchase,
        },
      },
      { [denom]: initialAsset.amount },
    )

    return [executeMsg]
  } else {
    const contractAddr = initialAsset.info.token?.contract_addr

    if (!contractAddr) {
      return []
    }

    const allowanceMsg = new MsgExecuteContract(
      wallet.key.accAddress,
      contractAddr,
      {
        increase_allowance: {
          spender: process.env.ASTROPORT_DCA,
          amount: initialAsset.amount,
        },
      },
    )

    const executeMsg = new MsgExecuteContract(
      wallet.key.accAddress,
      process.env.ASTROPORT_DCA as string,
      {
        create_dca_order: {
          initial_asset: initialAsset,
          target_asset: targetAsset,
          interval: interval,
          dca_amount: dcaAmount,
          first_purchase: firstPurchase,
        },
      },
    )

    return [allowanceMsg, executeMsg]
  }
}
