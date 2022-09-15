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
  it('does dca purchase', async () => {
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

  it('filters out orders which are not purchasable', async () => {
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
      whitelisted_tokens: [
        {
          token: {
            contract_addr: 'token_contract_addr_2',
          },
        },
      ],
      factory_addr: 'factory_addr',
      router_addr: 'router_addr',
    })
    mockedDb.list.mockReturnValue([
      {
        address: 'user_address',
        orderIds: [1, 2],
      },
    ])
    mockedGetUserConfig.getUserConfig.mockResolvedValue({
      last_id: 2,
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
      {
        token_allowance: '2000',
        order: {
          id: 2,
          dca_amount: '200',
          initial_asset: {
            amount: '2000',
            info: {
              native_token: {
                denom: 'uluna',
              },
            },
          },
          interval: 100,
          last_purchase: Date.now() / 1000,
          target_asset: {
            token: {
              contract_addr: 'token_contract_addr',
            },
          },
        },
      },
    ])
    mockedAstroport.simulateSwap.mockImplementation(async (_amount, path) => {
      return {
        amount: path.length + '',
      }
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
            ask_asset_info: {
              token: { contract_addr: 'token_contract_addr' },
            },
          },
        },
      ],

      [{ info: { native_token: { denom: 'uluna' } }, amount: '10' }],
    )
  })

  it('does most valuable dca purchase', async () => {
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
      {
        asset_infos: [
          {
            native_token: {
              denom: 'uluna',
            },
          },
          {
            token: {
              contract_addr: 'token_contract_addr_2',
            },
          },
        ],
        contract_addr: 'contract_addr',
        liquidity_token: 'liquidity_token',
        pair_type: {},
      },
      {
        asset_infos: [
          {
            token: {
              contract_addr: 'token_contract_addr_2',
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
      whitelisted_tokens: [
        {
          token: {
            contract_addr: 'token_contract_addr_2',
          },
        },
      ],
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
    mockedAstroport.simulateSwap.mockImplementation(async (_amount, path) => {
      return {
        amount: path.length + '',
      }
    })

    await watchIteration({})

    expect(mockedGetConfig.getConfig).toBeCalledTimes(1)
    expect(mockedGetUserConfig.getUserConfig).toBeCalledTimes(1)
    expect(mockedGetUserConfig.getUserConfig).toBeCalledWith('user_address')
    expect(mockedGetDcaOrders.getDcaOrders).toBeCalledTimes(1)
    expect(mockedGetDcaOrders.getDcaOrders).toBeCalledWith('user_address')
    expect(mockedAstroport.simulateSwap).toBeCalledTimes(3)
    expect(mockedAstroport.simulateSwap).toBeCalledWith(
      '100',
      ['uluna', 'token_contract_addr'],
      new Set(['uluna']),
    )
    expect(mockedAstroport.simulateSwap).toBeCalledWith(
      '100',
      ['uluna', 'token_contract_addr_2', 'token_contract_addr'],
      new Set(['uluna']),
    )
    expect(mockedAstroport.simulateSwap).toBeCalledWith(
      '100',
      ['uluna', 'token_contract_addr_2', 'uluna', 'token_contract_addr'],
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
            ask_asset_info: {
              token: { contract_addr: 'token_contract_addr_2' },
            },
          },
        },
        {
          astro_swap: {
            offer_asset_info: {
              token: { contract_addr: 'token_contract_addr_2' },
            },
            ask_asset_info: { native_token: { denom: 'uluna' } },
          },
        },
        {
          astro_swap: {
            offer_asset_info: { native_token: { denom: 'uluna' } },
            ask_asset_info: { token: { contract_addr: 'token_contract_addr' } },
          },
        },
      ],

      [
        { info: { native_token: { denom: 'uluna' } }, amount: '10' },
        { info: { native_token: { denom: 'uluna' } }, amount: '10' },
        { info: { native_token: { denom: 'uluna' } }, amount: '10' },
      ],
    )
  })

  it('doesnt perform swap if not enough fees', async () => {
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
      tip_balance: [],
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

    await watchIteration({})

    expect(mockedGetConfig.getConfig).toBeCalledTimes(1)
    expect(mockedGetUserConfig.getUserConfig).toBeCalledTimes(1)
    expect(mockedGetUserConfig.getUserConfig).toBeCalledWith('user_address')
    expect(mockedGetDcaOrders.getDcaOrders).toBeCalledTimes(1)
    expect(mockedGetDcaOrders.getDcaOrders).toBeCalledWith('user_address')
    expect(mockedAstroport.simulateSwap).toBeCalledTimes(0)
    expect(mockedPerformDcaPurchaseExecute.default).toBeCalledTimes(0)
  })

  it('doesnt perform swap if empty addresses', async () => {
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
    mockedDb.list.mockReturnValue([])
    await watchIteration({})

    expect(mockedGetConfig.getConfig).toBeCalledTimes(1)
    expect(mockedGetUserConfig.getUserConfig).toBeCalledTimes(0)
    expect(mockedGetDcaOrders.getDcaOrders).toBeCalledTimes(0)
    expect(mockedAstroport.simulateSwap).toBeCalledTimes(0)
    expect(mockedPerformDcaPurchaseExecute.default).toBeCalledTimes(0)
  })

  it('doesnt dca purchase if simulate options', async () => {
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

    await watchIteration({ simulate: true })

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
    expect(mockedPerformDcaPurchaseExecute.default).toBeCalledTimes(0)
  })
})
