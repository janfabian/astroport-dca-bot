import { LCDClient, MnemonicKey, Wallet } from '@terra-money/terra.js'
import { Asset, DcaQueryInfo } from '../types/astroport.js'
import cancelDcaOrder from './cancel-dca-order.js'

describe('cancelDcaOrder', () => {
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

  it('cancel order message native tokens', () => {
    const id = 1
    const originalOrder: DcaQueryInfo = {
      token_allowance: '100',
      order: {
        id: 1,
        initial_asset: {
          info: {
            native_token: {
              denom: 'uluna',
            },
          },
          amount: '100',
        },
        target_asset: {
          native_token: {
            denom: 'uluna',
          },
        },
        interval: 10,
        last_purchase: 0,
        dca_amount: '10',
      },
    }

    const result = cancelDcaOrder(wallet, originalOrder)

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        cancel_dca_order: {
          id: id,
        },
      },
    }

    expect(result).toEqual([expect.objectContaining(expected)])
    expect(result[0]?.coins.toData()).toEqual([])
  })

  it('cancel order message contract tokens', () => {
    const id = 1
    const originalOrder: DcaQueryInfo = {
      token_allowance: '100',
      order: {
        id: 1,
        initial_asset: {
          info: {
            token: {
              contract_addr: 'contract_addr',
            },
          },
          amount: '100',
        },
        target_asset: {
          native_token: {
            denom: 'uluna',
          },
        },
        interval: 10,
        last_purchase: 0,
        dca_amount: '10',
      },
    }

    const result = cancelDcaOrder(wallet, originalOrder)

    const expectedAllowance = {
      sender: wallet.key.accAddress,
      contract: 'contract_addr',
      execute_msg: {
        decrease_allowance: {
          spender: ASTROPORT_DCA,
          amount: '100',
        },
      },
    }

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        cancel_dca_order: {
          id: id,
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
