import { getMockedLCDClient } from './test-lib.js'
import * as terra from '../terra.js'
import * as cancelDcaOrderExecuteExecute from '../executes/cancel-dca-order.js'

import { cancelDcaOrder } from './cancel-dca-order.js'
import { InvalidOptionArgumentError } from 'commander'

jest.mock('../terra.js')
jest.mock('../astroport.js')
jest.mock('../executes/cancel-dca-order.js')
jest.mock('./add-address.js')

const mockedTerra = jest.mocked(terra, { shallow: true })
const mockedCancelDcaOrderExecuteExecute = jest.mocked(
  cancelDcaOrderExecuteExecute,
  { shallow: true },
)

describe('cancelDcaOrder', () => {
  it('cancels dca order', async () => {
    const client = getMockedLCDClient()
    const originalOrder = {
      token_allowance: '1000',
      order: {
        id: 1,
        initial_asset: {
          info: { native_token: { denom: 'uluna' } },
          amount: '1000',
        },
        target_asset: {
          native_token: {
            denom: 'axlUSDC',
          },
        },
        interval: 60,
        last_purchase: 1663217160,
        dca_amount: '10',
      },
    }
    client.wasm.contractQuery = jest.fn().mockResolvedValue([originalOrder])

    mockedTerra.getLCDClient.mockResolvedValue(client)

    await cancelDcaOrder({
      orderId: 1,
    })

    expect(mockedTerra.getKey).toBeCalledTimes(1)
    expect(client.wasm.contractQuery).toBeCalledTimes(1)
    expect(mockedCancelDcaOrderExecuteExecute.default).toBeCalledTimes(1)
    expect(mockedCancelDcaOrderExecuteExecute.default).toBeCalledWith(
      expect.any(Object),
      originalOrder,
    )
  })

  it('doesnt cancel nonexisting dca order', async () => {
    const client = getMockedLCDClient()
    client.wasm.contractQuery = jest.fn().mockResolvedValue([])

    mockedTerra.getLCDClient.mockResolvedValue(client)

    expect.assertions(4)
    try {
      await cancelDcaOrder({
        orderId: 1,
      })
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidOptionArgumentError)
    }

    expect(mockedTerra.getKey).toBeCalledTimes(1)
    expect(client.wasm.contractQuery).toBeCalledTimes(1)
    expect(mockedCancelDcaOrderExecuteExecute.default).toBeCalledTimes(0)
  })
})
