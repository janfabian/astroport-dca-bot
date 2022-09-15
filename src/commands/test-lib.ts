import { LCDClient } from '@terra-money/terra.js'

export const TEST_WALLET_ACC_ADDRESS = 'test-wallet-address'

export function getMockedLCDClient(opts = {}) {
  const client = new LCDClient({
    URL: 'test',
    chainID: 'test',
    ...opts,
  })

  client.wallet = jest.fn().mockReturnValue({
    createAndSignTx: jest.fn(),
    key: {
      accAddress: TEST_WALLET_ACC_ADDRESS,
    },
  })

  client.tx.broadcast = jest.fn().mockResolvedValue({
    txhash: 'test_txhash',
  })

  return client
}
