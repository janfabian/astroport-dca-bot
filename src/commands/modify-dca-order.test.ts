import { getMockedLCDClient, TEST_WALLET_ACC_ADDRESS } from './test-lib.js'
import * as terra from '../terra.js'
import * as astroport from '../astroport.js'
import * as modifyDcaOrderExecute from '../executes/modify-dca-order.js'
import * as addAddress from './add-address.js'

import { modifyDcaOrder } from './modify-dca-order.js'
import { InvalidOptionArgumentError } from 'commander'

jest.mock('../terra.js')
jest.mock('../astroport.js')
jest.mock('../executes/modify-dca-order.js')
jest.mock('./add-address.js')

const mockedTerra = jest.mocked(terra, true)
const mockedAstroport = jest.mocked(astroport, true)
const mockedAddAddress = jest.mocked(addAddress, true)
const mockedModifyDcaOrderExecute = jest.mocked(modifyDcaOrderExecute, true)

describe('modifyDcaOrder', () => {
  it('modifies dca order new initial amount', async () => {
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
    mockedAstroport.getPairs.mockResolvedValue([
      {
        asset_infos: [
          {
            native_token: {
              denom: 'uluna',
            },
          },
          {
            token: {
              contract_addr: 'axlUSDC',
            },
          },
        ],
        contract_addr: 'contract_addr',
        liquidity_token: 'liquidity_token',
        pair_type: {},
      },
    ])

    const newInitial = ['1500', 'uluna']

    await modifyDcaOrder({
      orderId: 1,
      initial: newInitial,
    })

    expect(mockedTerra.getKey).toBeCalledTimes(1)
    expect(mockedAddAddress.addAddress).toBeCalledTimes(1)
    expect(mockedAddAddress.addAddress).toBeCalledWith(
      TEST_WALLET_ACC_ADDRESS,
      {},
    )
    expect(mockedModifyDcaOrderExecute.default).toBeCalledTimes(1)
    expect(mockedModifyDcaOrderExecute.default).toBeCalledWith(
      expect.any(Object),
      originalOrder.order,
      { info: { native_token: { denom: 'uluna' } }, amount: '1500' },
      undefined,
      undefined,
      undefined,
      undefined,
    )
  })

  it('modifies dca order target, interval, dcaAmount', async () => {
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
    mockedAstroport.getPairs.mockResolvedValue([
      {
        asset_infos: [
          {
            native_token: {
              denom: 'uluna',
            },
          },
          {
            token: {
              contract_addr: 'axlUSDC',
            },
          },
        ],
        contract_addr: 'contract_addr',
        liquidity_token: 'liquidity_token',
        pair_type: {},
      },
    ])

    const newTarget = 'another_token_contract_addr'
    const newInterval = 100
    const newDcaAmount = '100'

    await modifyDcaOrder({
      orderId: 1,
      target: newTarget,
      interval: newInterval,
      dcaAmount: newDcaAmount,
    })

    expect(mockedTerra.getKey).toBeCalledTimes(1)
    expect(mockedAddAddress.addAddress).toBeCalledTimes(1)
    expect(mockedAddAddress.addAddress).toBeCalledWith(
      TEST_WALLET_ACC_ADDRESS,
      {},
    )
    expect(mockedModifyDcaOrderExecute.default).toBeCalledTimes(1)
    expect(mockedModifyDcaOrderExecute.default).toBeCalledWith(
      expect.any(Object),
      originalOrder.order,
      undefined,
      { token: { contract_addr: 'another_token_contract_addr' } },
      newInterval,
      newDcaAmount,
      undefined,
    )
  })

  it('doesnt modify nonexisting dca order', async () => {
    const client = getMockedLCDClient()
    client.wasm.contractQuery = jest.fn().mockResolvedValue([])

    mockedTerra.getLCDClient.mockResolvedValue(client)

    expect.assertions(4)
    try {
      await modifyDcaOrder({
        orderId: 1,
      })
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidOptionArgumentError)
    }

    expect(mockedTerra.getKey).toBeCalledTimes(1)
    expect(client.wasm.contractQuery).toBeCalledTimes(1)
    expect(mockedModifyDcaOrderExecute.default).toBeCalledTimes(0)
  })
})
