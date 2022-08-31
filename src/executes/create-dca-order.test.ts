import { LCDClient, MnemonicKey, Wallet } from '@terra-money/terra.js'
import createDcaOrder from './create-dca-order.js'

describe('createDcaOrder', () => {
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

  it('native initial asset, target native asset', () => {
    const initialAsset = {
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

    const result = createDcaOrder(
      wallet,
      initialAsset,
      targetAsset,
      interval,
      dcaAmount,
    )

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        create_dca_order: {
          initial_asset: initialAsset,
          target_asset: targetAsset,
          interval: interval,
          dca_amount: dcaAmount,
        },
      },
    }

    expect(result).toEqual([expect.objectContaining(expected)])
    expect(result[0]?.coins.toData()).toEqual([
      { denom: 'uluna', amount: '100000' },
    ])
  })

  it('native initial asset, target token asset', () => {
    const initialAsset = {
      info: {
        native_token: {
          denom: 'uluna',
        },
      },
      amount: '100000',
    }

    const targetAsset = {
      token: {
        contract_addr: 'contract_addr',
      },
    }

    const interval = 100
    const dcaAmount = '10'

    const result = createDcaOrder(
      wallet,
      initialAsset,
      targetAsset,
      interval,
      dcaAmount,
    )

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        create_dca_order: {
          initial_asset: initialAsset,
          target_asset: targetAsset,
          interval: interval,
          dca_amount: dcaAmount,
        },
      },
    }

    expect(result).toEqual([expect.objectContaining(expected)])
    expect(result[0]?.coins.toData()).toEqual([
      { denom: 'uluna', amount: '100000' },
    ])
  })

  it('token initial asset, target native asset', () => {
    const initialAsset = {
      info: {
        token: {
          contract_addr: 'contract_addr',
        },
      },
      amount: '100000',
    }

    const targetAsset = {
      native_token: {
        denom: 'uluna',
      },
    }

    const interval = 100
    const dcaAmount = '10'

    const result = createDcaOrder(
      wallet,
      initialAsset,
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
          amount: initialAsset.amount,
        },
      },
    }

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        create_dca_order: {
          initial_asset: initialAsset,
          target_asset: targetAsset,
          interval: interval,
          dca_amount: dcaAmount,
        },
      },
    }

    expect(result).toEqual([
      expect.objectContaining(expectedAllowance),
      expect.objectContaining(expected),
    ])
    expect(result[0]?.coins.toData()).toEqual([])
  })

  it('token initial asset, target token asset', () => {
    const initialAsset = {
      info: {
        token: {
          contract_addr: 'contract_addr',
        },
      },
      amount: '100000',
    }

    const targetAsset = {
      token: {
        contract_addr: 'contract_addr 2',
      },
    }

    const interval = 100
    const dcaAmount = '10'

    const result = createDcaOrder(
      wallet,
      initialAsset,
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
          amount: initialAsset.amount,
        },
      },
    }

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        create_dca_order: {
          initial_asset: initialAsset,
          target_asset: targetAsset,
          interval: interval,
          dca_amount: dcaAmount,
        },
      },
    }

    expect(result).toEqual([
      expect.objectContaining(expectedAllowance),
      expect.objectContaining(expected),
    ])
    expect(result[0]?.coins.toData()).toEqual([])
  })
})
