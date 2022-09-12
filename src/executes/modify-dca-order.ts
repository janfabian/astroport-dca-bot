import { MsgExecuteContract, Wallet } from '@terra-money/terra.js'
import { isNativeToken } from '../lib.js'
import { Asset, AssetInfo, Order } from '../types/astroport.js'

export default function modifyDcaOrder(
  wallet: Wallet,
  originalOrder: Order & { id: number },
  newInitialAsset?: Asset,
  newTargetAsset?: AssetInfo,
  newInterval?: number,
  newDcaAmount?: string,
  newFirstPurchase?: number,
) {
  const msgs: MsgExecuteContract[] = []
  const orderId = originalOrder.id

  newInitialAsset = newInitialAsset ?? originalOrder.initial_asset
  newTargetAsset = newTargetAsset ?? originalOrder.target_asset
  newInterval = newInterval ?? originalOrder.interval
  newDcaAmount = newDcaAmount ?? originalOrder.dca_amount
  newFirstPurchase = newFirstPurchase ?? originalOrder.first_purchase

  if (isNativeToken(newInitialAsset.info)) {
    let amount = BigInt(newInitialAsset.amount)
    const denom = newInitialAsset.info.native_token?.denom as string

    if (isNativeToken(originalOrder.initial_asset.info)) {
      // the same denom, check the diff
      if (denom === originalOrder.initial_asset.info.native_token?.denom) {
        amount =
          BigInt(newInitialAsset.amount) -
          BigInt(originalOrder.initial_asset.amount)
      }
    } else {
      const originalContractAddr = originalOrder.initial_asset.info.token
        ?.contract_addr as string
      const decreaseAllowanceMsg = new MsgExecuteContract(
        wallet.key.accAddress,
        originalContractAddr,
        {
          decrease_allowance: {
            spender: process.env.ASTROPORT_DCA,
            amount: originalOrder.initial_asset.amount,
          },
        },
      )

      msgs.push(decreaseAllowanceMsg)
    }

    const funds = {}

    if (amount > 0n) {
      funds[denom] = amount.toString()
    }

    const modifyMsg = new MsgExecuteContract(
      wallet.key.accAddress,
      process.env.ASTROPORT_DCA as string,
      {
        modify_dca_order: {
          id: orderId,
          new_initial_asset: newInitialAsset,
          new_target_asset: newTargetAsset,
          new_interval: newInterval,
          new_dca_amount: newDcaAmount,
          new_first_purchase: newFirstPurchase,
        },
      },
      funds,
    )
    msgs.push(modifyMsg)
  } else {
    let amount = BigInt(newInitialAsset.amount)
    const contractAddr = newInitialAsset.info.token?.contract_addr as string

    if (!isNativeToken(originalOrder.initial_asset.info)) {
      const originalContractAddr = originalOrder.initial_asset.info.token
        ?.contract_addr as string

      // the same denom, check the diff
      if (contractAddr === originalContractAddr) {
        amount =
          BigInt(newInitialAsset.amount) -
          BigInt(originalOrder.initial_asset.amount)
      } else {
        const decreaseAllowanceMsg = new MsgExecuteContract(
          wallet.key.accAddress,
          originalContractAddr,
          {
            decrease_allowance: {
              spender: process.env.ASTROPORT_DCA,
              amount: originalOrder.initial_asset.amount,
            },
          },
        )

        msgs.push(decreaseAllowanceMsg)
      }
    }

    if (amount > 0n) {
      const increaseAllowanceMsg = new MsgExecuteContract(
        wallet.key.accAddress,
        contractAddr,
        {
          increase_allowance: {
            spender: process.env.ASTROPORT_DCA,
            amount: amount.toString(),
          },
        },
      )
      msgs.push(increaseAllowanceMsg)
    }

    if (amount < 0n) {
      const decreaseAllowanceMsg = new MsgExecuteContract(
        wallet.key.accAddress,
        contractAddr,
        {
          decrease_allowance: {
            spender: process.env.ASTROPORT_DCA,
            amount: (-amount).toString(),
          },
        },
      )
      msgs.push(decreaseAllowanceMsg)
    }

    const modifyMsg = new MsgExecuteContract(
      wallet.key.accAddress,
      process.env.ASTROPORT_DCA as string,
      {
        modify_dca_order: {
          id: orderId,
          new_initial_asset: newInitialAsset,
          new_target_asset: newTargetAsset,
          new_interval: newInterval,
          new_dca_amount: newDcaAmount,
          new_first_purchase: newFirstPurchase,
        },
      },
    )
    msgs.push(modifyMsg)
  }

  return msgs
}
