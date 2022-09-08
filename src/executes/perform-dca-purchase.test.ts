import { LCDClient, MnemonicKey, Wallet } from '@terra-money/terra.js'
import performDcaPurchase from './perform-dca-purchase.js'

describe('performDcaPurchase', () => {
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

  it('create a purchase', () => {
    const orderId = 1
    const address = 'address'
    const hops = [
      {
        astro_swap: {
          offer_asset_info: {
            native_token: {
              denom: 'uluna',
            },
          },
          ask_asset_info: {
            native_token: {
              denom: 'axlUSDC',
            },
          },
        },
      },
    ]

    const feeRedeem = [
      {
        info: {
          native_token: {
            denom: 'axlUSDC',
          },
        },
        amount: '1',
      },
    ]

    const result = performDcaPurchase(wallet, orderId, address, hops, feeRedeem)

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        perform_dca_purchase: {
          id: orderId,
          user: address,
          hops: hops,
          fee_redeem: feeRedeem,
        },
      },
    }

    expect(result).toEqual([expect.objectContaining(expected)])
    expect(result[0]?.coins.toData()).toEqual([])
  })
})
