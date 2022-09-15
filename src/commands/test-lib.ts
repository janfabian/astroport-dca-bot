import { LCDClient } from '@terra-money/terra.js'

export function getMockedLCDClient(opts = {}) {
  const client = new LCDClient({
    URL: 'test',
    chainID: 'test',
    ...opts,
  })

  client.wallet = jest.fn().mockReturnValue({
    createAndSignTx: jest.fn(),
  })

  client.tx.broadcast = jest.fn().mockResolvedValue({
    txhash: 'test_txhash',
  })

  return client
}
