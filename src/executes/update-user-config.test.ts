import { LCDClient, MnemonicKey, Wallet } from '@terra-money/terra.js'
import { UserConfigQuery } from '../types/astroport.js'
import updateUserConfig from './update-user-config.js'

describe('updateUserConfig', () => {
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

  it('leaves original values if provided new empty values', () => {
    const originalUserConfig: UserConfigQuery = {
      last_id: 0,
      tip_balance: [],
      max_hops: 5,
      max_spread: '0.1',
    }

    const result = updateUserConfig(wallet, originalUserConfig)

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        update_user_config: {
          max_hops: originalUserConfig.max_hops,
          max_spread: originalUserConfig.max_spread,
        },
      },
    }

    expect(result).toEqual([expect.objectContaining(expected)])
    expect(result[0]?.coins.toData()).toEqual([])
  })

  it('updates values if provided new values', () => {
    const originalUserConfig: UserConfigQuery = {
      last_id: 0,
      tip_balance: [],
      max_hops: 5,
      max_spread: '0.1',
    }

    const newMaxHops = 10
    const newMaxSpread = '0.2'

    const result = updateUserConfig(
      wallet,
      originalUserConfig,
      newMaxHops,
      newMaxSpread,
    )

    const expected = {
      sender: wallet.key.accAddress,
      contract: ASTROPORT_DCA,
      execute_msg: {
        update_user_config: {
          max_hops: newMaxHops,
          max_spread: newMaxSpread,
        },
      },
    }

    expect(result).toEqual([expect.objectContaining(expected)])
    expect(result[0]?.coins.toData()).toEqual([])
  })
})
