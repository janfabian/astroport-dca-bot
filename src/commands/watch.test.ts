import { getMockedLCDClient } from './test-lib.js'
import * as terra from '../terra.js'
import * as astroport from '../astroport.js'
import * as getConfig from './get-config.js'
import * as getUserConfig from './get-user-config.js'
import * as getDcaOrders from './get-dca-orders.js'
import * as db from '../db.js'
import * as performDcaPurchaseExecute from '../executes/perform-dca-purchase.js'

import { watchIteration } from './watch.js'

jest.mock('../terra.js')
jest.mock('../astroport.js')
jest.mock('./get-config.js')
jest.mock('./get-user-config.js')
jest.mock('./get-dca-orders.js')
jest.mock('../db.js')
jest.mock('../executes/perform-dca-purchase.js')

const mockedTerra = jest.mocked(terra, true)
const mockedAstroport = jest.mocked(astroport, true)
const mockedGetConfig = jest.mocked(getConfig, true)
const mockedGetUserConfig = jest.mocked(getUserConfig, true)
const mockedGetDcaOrders = jest.mocked(getDcaOrders, true)
const mockedPerformDcaPurchaseExecute = jest.mocked(
  performDcaPurchaseExecute,
  true,
)
const mockedDb = jest.mocked(db, true)

describe('watch', () => {
  it('watches addresses', async () => {
    const client = getMockedLCDClient()

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
              contract_addr: 'token_contract_addr',
            },
          },
        ],
        contract_addr: 'contract_addr',
        liquidity_token: 'liquidity_token',
        pair_type: {},
      },
    ])
    mockedGetConfig.getConfig.mockResolvedValue({
      max_hops: 10,
      max_spread: '0.05',
      whitelisted_fee_assets: [
        {
          amount: '10',
          info: {
            native_token: {
              denom: 'uluna',
            },
          },
        },
      ],
      whitelisted_tokens: [],
      factory_addr: 'factory_addr',
      router_addr: 'router_addr',
    })
    mockedDb.list.mockReturnValue([
      {
        address: 'user_address',
        orderIds: [1],
      },
    ])
    mockedGetUserConfig.getUserConfig.mockResolvedValue({
      last_id: 1,
      tip_balance: [
        {
          amount: '1000',
          info: {
            native_token: {
              denom: 'uluna',
            },
          },
        },
      ],
    })
    mockedGetDcaOrders.getDcaOrders.mockResolvedValue([
      {
        token_allowance: '1000',
        order: {
          id: 1,
          dca_amount: '100',
          initial_asset: {
            amount: '1000',
            info: {
              native_token: {
                denom: 'uluna',
              },
            },
          },
          interval: 1,
          last_purchase: 0,
          target_asset: {
            token: {
              contract_addr: 'token_contract_addr',
            },
          },
        },
      },
    ])
    mockedAstroport.simulateSwap.mockResolvedValue({
      amount: '1',
    })

    await watchIteration({})

    expect(mockedGetConfig.getConfig).toBeCalledTimes(1)
    expect(mockedGetUserConfig.getUserConfig).toBeCalledTimes(1)
    expect(mockedGetUserConfig.getUserConfig).toBeCalledWith('user_address')
    expect(mockedGetDcaOrders.getDcaOrders).toBeCalledTimes(1)
    expect(mockedGetDcaOrders.getDcaOrders).toBeCalledWith('user_address')
    expect(mockedAstroport.simulateSwap).toBeCalledTimes(1)
    expect(mockedAstroport.simulateSwap).toBeCalledWith(
      '100',
      ['uluna', 'token_contract_addr'],
      new Set(['uluna']),
    )
    expect(mockedPerformDcaPurchaseExecute.default).toBeCalledWith(
      expect.any(Object),
      1,
      'user_address',
      [
        {
          astro_swap: {
            offer_asset_info: { native_token: { denom: 'uluna' } },
            ask_asset_info: { token: { contract_addr: 'token_contract_addr' } },
          },
        },
      ],
      [{ info: { native_token: { denom: 'uluna' } }, amount: '10' }],
    )
  })
})
