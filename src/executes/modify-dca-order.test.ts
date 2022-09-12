import { LCDClient, MnemonicKey, Wallet } from '@terra-money/terra.js'
import modifyDcaOrder from './modify-dca-order.js'

describe('modifyDcaOrder', () => {
  const ASTROPORT_DCA = 'ASTROPORT_DCA_CONTRACT_ADDRESS'
  process.env.ASTROPORT_DCA = ASTROPORT_DCA

  let wallet: Wallet

  beforeAll(() => {
    const key = new MnemonicKey()
    const terra = new LCDClient({
      URL: 'https://pisco-lcd.terra.dev',
      chainID: 'pisco-1',
    })
    wallet = terra.wallet(key)
  })

  it('change target, interval, dca_amount', () => {
    const id = 1
    const initialAsset = {
      info: {
        native_token: {
          denom: 'uluna',
        },
      },
      amount: '100000',
    }

    const modifiedInitialAsset = initialAsset

    const targetAsset = {
      native_token: {
        denom: 'axlUSDC',
      },
    }
    const modifiedTargetAsset = {
      native_token: {
        denom: 'axlUSDT',
      },
    }

    const interval = 100
    const modifiedInterval = 1000

    const dcaAmount = '10'
    const modifiedDcaAmount = '100'

    const originalOrder = {
      id,
      initial_asset: initialAsset,
      target_asset: targetAsset,
      interval: interval,
      last_purchase: 0,
      dca_amount: dcaAmount,
    }

    const result = modifyDcaOrder(
      wallet,
      originalOrder,
      modifiedInitialAsset,
      modifiedTargetAsset,
      modifiedInterval,
      modifiedDcaAmount,
    )

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        modify_dca_order: {
          id,
          new_initial_asset: modifiedInitialAsset,
          new_target_asset: modifiedTargetAsset,
          new_interval: modifiedInterval,
          new_dca_amount: modifiedDcaAmount,
        },
      },
    }

    expect(result).toEqual([expect.objectContaining(expected)])
    expect(result[0]?.coins.toData()).toEqual([])
  })

  it('original native initial, modified native initial, different denom', () => {
    const id = 1
    const initialAsset = {
      info: {
        native_token: {
          denom: 'uluna',
        },
      },
      amount: '100000',
    }

    const modifiedInitialAsset = {
      info: {
        native_token: {
          denom: 'axlUSDT',
        },
      },
      amount: '100000',
    }

    const targetAsset = {
      native_token: {
        denom: 'axlUSDC',
      },
    }

    const interval = 100
    const dcaAmount = '10'

    const originalOrder = {
      id,
      initial_asset: initialAsset,
      target_asset: targetAsset,
      interval: interval,
      last_purchase: 0,
      dca_amount: dcaAmount,
    }

    const result = modifyDcaOrder(
      wallet,
      originalOrder,
      modifiedInitialAsset,
      targetAsset,
      interval,
      dcaAmount,
    )

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        modify_dca_order: {
          id,
          new_initial_asset: modifiedInitialAsset,
          new_target_asset: targetAsset,
          new_interval: interval,
          new_dca_amount: dcaAmount,
        },
      },
    }

    expect(result).toEqual([expect.objectContaining(expected)])
    expect(result[0]?.coins.toData()).toEqual([
      { denom: 'axlUSDT', amount: '100000' },
    ])
  })

  it('original native initial, modified native initial, same denom', () => {
    const id = 1
    const initialAsset = {
      info: {
        native_token: {
          denom: 'uluna',
        },
      },
      amount: '100000',
    }

    const modifiedInitialAsset = {
      info: {
        native_token: {
          denom: 'uluna',
        },
      },
      amount: '100001',
    }

    const targetAsset = {
      native_token: {
        denom: 'axlUSDC',
      },
    }

    const interval = 100
    const dcaAmount = '10'

    const originalOrder = {
      id,
      initial_asset: initialAsset,
      target_asset: targetAsset,
      interval: interval,
      last_purchase: 0,
      dca_amount: dcaAmount,
    }

    const result = modifyDcaOrder(
      wallet,
      originalOrder,
      modifiedInitialAsset,
      targetAsset,
      interval,
      dcaAmount,
    )

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        modify_dca_order: {
          id,
          new_initial_asset: modifiedInitialAsset,
          new_target_asset: targetAsset,
          new_interval: interval,
          new_dca_amount: dcaAmount,
        },
      },
    }

    expect(result).toEqual([expect.objectContaining(expected)])
    expect(result[0]?.coins.toData()).toEqual([{ denom: 'uluna', amount: '1' }])
  })

  it('original native initial, modified native initial, same denom', () => {
    const id = 1
    const initialAsset = {
      info: {
        native_token: {
          denom: 'uluna',
        },
      },
      amount: '100000',
    }

    const modifiedInitialAsset = {
      info: {
        native_token: {
          denom: 'uluna',
        },
      },
      amount: '99999',
    }

    const targetAsset = {
      native_token: {
        denom: 'axlUSDC',
      },
    }

    const interval = 100
    const dcaAmount = '10'

    const originalOrder = {
      id,
      initial_asset: initialAsset,
      target_asset: targetAsset,
      interval: interval,
      last_purchase: 0,
      dca_amount: dcaAmount,
    }

    const result = modifyDcaOrder(
      wallet,
      originalOrder,
      modifiedInitialAsset,
      targetAsset,
      interval,
      dcaAmount,
    )

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        modify_dca_order: {
          id,
          new_initial_asset: modifiedInitialAsset,
          new_target_asset: targetAsset,
          new_interval: interval,
          new_dca_amount: dcaAmount,
        },
      },
    }

    expect(result).toEqual([expect.objectContaining(expected)])
    expect(result[0]?.coins.toData()).toEqual([])
  })

  it('original token initial, modified native initial', () => {
    const id = 1
    const initialAsset = {
      info: {
        token: {
          contract_addr: 'contract_addr',
        },
      },
      amount: '100000',
    }

    const modifiedInitialAsset = {
      info: {
        native_token: {
          denom: 'uluna',
        },
      },
      amount: '100000',
    }

    const targetAsset = {
      native_token: {
        denom: 'axlUSDC',
      },
    }

    const interval = 100
    const dcaAmount = '10'

    const originalOrder = {
      id,
      initial_asset: initialAsset,
      target_asset: targetAsset,
      interval: interval,
      last_purchase: 0,
      dca_amount: dcaAmount,
    }

    const result = modifyDcaOrder(
      wallet,
      originalOrder,
      modifiedInitialAsset,
      targetAsset,
      interval,
      dcaAmount,
    )

    const expectedAllowance = {
      sender: wallet.key.accAddress,
      contract: 'contract_addr',
      execute_msg: {
        decrease_allowance: {
          spender: ASTROPORT_DCA,
          amount: initialAsset.amount,
        },
      },
    }

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        modify_dca_order: {
          id,
          new_initial_asset: modifiedInitialAsset,
          new_target_asset: targetAsset,
          new_interval: interval,
          new_dca_amount: dcaAmount,
        },
      },
    }

    expect(result).toEqual([
      expect.objectContaining(expectedAllowance),
      expect.objectContaining(expected),
    ])
    expect(result[1]?.coins.toData()).toEqual([
      { denom: 'uluna', amount: '100000' },
    ])
  })

  it('original contract initial, modified native initial', () => {
    const id = 1
    const initialAsset = {
      info: {
        token: {
          contract_addr: 'contract_addr',
        },
      },
      amount: '100000',
    }

    const modifiedInitialAsset = {
      info: {
        native_token: {
          denom: 'axlUSDT',
        },
      },
      amount: '100000',
    }

    const targetAsset = {
      native_token: {
        denom: 'axlUSDC',
      },
    }

    const interval = 100
    const dcaAmount = '10'

    const originalOrder = {
      id,
      initial_asset: initialAsset,
      target_asset: targetAsset,
      interval: interval,
      last_purchase: 0,
      dca_amount: dcaAmount,
    }

    const result = modifyDcaOrder(
      wallet,
      originalOrder,
      modifiedInitialAsset,
      targetAsset,
      interval,
      dcaAmount,
    )

    const expectedAllowance = {
      sender: wallet.key.accAddress,
      contract: 'contract_addr',
      execute_msg: {
        decrease_allowance: {
          spender: ASTROPORT_DCA,
          amount: initialAsset.amount,
        },
      },
    }

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        modify_dca_order: {
          id,
          new_initial_asset: modifiedInitialAsset,
          new_target_asset: targetAsset,
          new_interval: interval,
          new_dca_amount: dcaAmount,
        },
      },
    }

    expect(result).toEqual([
      expect.objectContaining(expectedAllowance),
      expect.objectContaining(expected),
    ])
    expect(result[1]?.coins.toData()).toEqual([
      { denom: 'axlUSDT', amount: '100000' },
    ])
  })

  it('original contract initial, modified contract initial, different denom', () => {
    const id = 1
    const initialAsset = {
      info: {
        token: {
          contract_addr: 'contract_addr',
        },
      },
      amount: '100000',
    }

    const modifiedInitialAsset = {
      info: {
        token: {
          contract_addr: 'contract_addr 2',
        },
      },
      amount: '100000',
    }

    const targetAsset = {
      native_token: {
        denom: 'axlUSDC',
      },
    }

    const interval = 100
    const dcaAmount = '10'

    const originalOrder = {
      id,
      initial_asset: initialAsset,
      target_asset: targetAsset,
      interval: interval,
      last_purchase: 0,
      dca_amount: dcaAmount,
    }

    const result = modifyDcaOrder(
      wallet,
      originalOrder,
      modifiedInitialAsset,
      targetAsset,
      interval,
      dcaAmount,
    )

    const expectedAllowance = {
      sender: wallet.key.accAddress,
      contract: 'contract_addr',
      execute_msg: {
        decrease_allowance: {
          spender: ASTROPORT_DCA,
          amount: initialAsset.amount,
        },
      },
    }

    const expectedAllowance2 = {
      sender: wallet.key.accAddress,
      contract: 'contract_addr 2',
      execute_msg: {
        increase_allowance: {
          spender: ASTROPORT_DCA,
          amount: modifiedInitialAsset.amount,
        },
      },
    }

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        modify_dca_order: {
          id,
          new_initial_asset: modifiedInitialAsset,
          new_target_asset: targetAsset,
          new_interval: interval,
          new_dca_amount: dcaAmount,
        },
      },
    }

    expect(result).toEqual([
      expect.objectContaining(expectedAllowance),
      expect.objectContaining(expectedAllowance2),
      expect.objectContaining(expected),
    ])
    expect(result[2]?.coins.toData()).toEqual([])
  })

  it('original contract initial, modified contract initial, same token', () => {
    const id = 1
    const initialAsset = {
      info: {
        token: {
          contract_addr: 'contract_addr',
        },
      },
      amount: '100000',
    }

    const modifiedInitialAsset = {
      info: {
        token: {
          contract_addr: 'contract_addr',
        },
      },
      amount: '100001',
    }

    const targetAsset = {
      native_token: {
        denom: 'axlUSDC',
      },
    }

    const interval = 100
    const dcaAmount = '10'

    const originalOrder = {
      id,
      initial_asset: initialAsset,
      target_asset: targetAsset,
      interval: interval,
      last_purchase: 0,
      dca_amount: dcaAmount,
    }

    const result = modifyDcaOrder(
      wallet,
      originalOrder,
      modifiedInitialAsset,
      targetAsset,
      interval,
      dcaAmount,
    )

    const expectedAllowance = {
      sender: wallet.key.accAddress,
      contract: 'contract_addr',
      execute_msg: {
        increase_allowance: {
          spender: ASTROPORT_DCA,
          amount: '1',
        },
      },
    }

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        modify_dca_order: {
          id,
          new_initial_asset: modifiedInitialAsset,
          new_target_asset: targetAsset,
          new_interval: interval,
          new_dca_amount: dcaAmount,
        },
      },
    }

    expect(result).toEqual([
      expect.objectContaining(expectedAllowance),
      expect.objectContaining(expected),
    ])
    expect(result[1]?.coins.toData()).toEqual([])
  })

  it('original contract initial, modified contract initial, same token', () => {
    const id = 1
    const initialAsset = {
      info: {
        token: {
          contract_addr: 'contract_addr',
        },
      },
      amount: '100000',
    }

    const modifiedInitialAsset = {
      info: {
        token: {
          contract_addr: 'contract_addr',
        },
      },
      amount: '99999',
    }

    const targetAsset = {
      native_token: {
        denom: 'axlUSDC',
      },
    }

    const interval = 100
    const dcaAmount = '10'

    const originalOrder = {
      id,
      initial_asset: initialAsset,
      target_asset: targetAsset,
      interval: interval,
      last_purchase: 0,
      dca_amount: dcaAmount,
    }

    const result = modifyDcaOrder(
      wallet,
      originalOrder,
      modifiedInitialAsset,
      targetAsset,
      interval,
      dcaAmount,
    )

    const expectedAllowance = {
      sender: wallet.key.accAddress,
      contract: 'contract_addr',
      execute_msg: {
        decrease_allowance: {
          spender: ASTROPORT_DCA,
          amount: '1',
        },
      },
    }

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        modify_dca_order: {
          id,
          new_initial_asset: modifiedInitialAsset,
          new_target_asset: targetAsset,
          new_interval: interval,
          new_dca_amount: dcaAmount,
        },
      },
    }

    expect(result).toEqual([
      expect.objectContaining(expectedAllowance),
      expect.objectContaining(expected),
    ])
    expect(result[1]?.coins.toData()).toEqual([])
  })
})
