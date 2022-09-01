import { LCDClient, MnemonicKey, Wallet } from '@terra-money/terra.js'
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

  it('cancel order message', () => {
    const id = 1
    const result = cancelDcaOrder(wallet, id)

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
})
