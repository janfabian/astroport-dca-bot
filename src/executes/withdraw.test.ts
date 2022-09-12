import { LCDClient, MnemonicKey, Wallet } from '@terra-money/terra.js'
import withdraw from './withdraw.js'

describe('withdraw', () => {
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

  it('empty assets', () => {
    const assets = []
    const result = withdraw(wallet, assets)

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: { withdraw: { assets: [] } },
      coins: { _coins: {} },
    }

    expect(result).toEqual(expect.arrayContaining([expected]))
  })

  it('native assets', () => {
    const assets = [
      {
        info: {
          native_token: {
            denom: 'uluna',
          },
        },
        amount: '100000',
      },
    ]
    const result = withdraw(wallet, assets)

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        withdraw: {
          assets: [
            {
              info: { native_token: { denom: 'uluna' } },
              amount: '100000',
            },
          ],
        },
      },
    }

    expect(result).toEqual([expect.objectContaining(expected)])
    expect(result[0]?.coins.toData()).toEqual([])
  })

  it('token assets', () => {
    const assets = [
      {
        info: {
          token: {
            contract_addr: 'token_addr',
          },
        },
        amount: '100000',
      },
    ]
    const result = withdraw(wallet, assets)

    const expectedAllowance = {
      sender: wallet.key.accAddress,
      contract: 'token_addr',
      execute_msg: {
        decrease_allowance: {
          spender: ASTROPORT_DCA,
          amount: '100000',
        },
      },
    }

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        withdraw: {
          assets: [
            {
              info: {
                token: {
                  contract_addr: 'token_addr',
                },
              },
              amount: '100000',
            },
          ],
        },
      },
    }

    expect(result).toEqual([
      expect.objectContaining(expectedAllowance),
      expect.objectContaining(expected),
    ])
    expect(result[1]?.coins.toData()).toEqual([])
  })

  it('mixed token assets', () => {
    const assets = [
      {
        info: {
          token: {
            contract_addr: 'token_addr',
          },
        },
        amount: '100000',
      },
      {
        info: {
          native_token: {
            denom: 'uluna',
          },
        },
        amount: '200000',
      },
    ]
    const result = withdraw(wallet, assets)

    const expectedAllowance = {
      sender: wallet.key.accAddress,
      contract: 'token_addr',
      execute_msg: {
        decrease_allowance: {
          spender: ASTROPORT_DCA,
          amount: '100000',
        },
      },
    }

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        withdraw: {
          assets: [
            {
              info: {
                token: {
                  contract_addr: 'token_addr',
                },
              },
              amount: '100000',
            },
            {
              info: { native_token: { denom: 'uluna' } },
              amount: '200000',
            },
          ],
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
