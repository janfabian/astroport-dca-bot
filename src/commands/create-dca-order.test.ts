import { getMockedLCDClient, TEST_WALLET_ACC_ADDRESS } from './test-lib.js'
import * as terra from '../terra.js'
import * as astroport from '../astroport.js'
import * as createDcaOrderExecute from '../executes/create-dca-order.js'
import * as addAddress from './add-address.js'

import { createDcaOrder } from './create-dca-order.js'

jest.mock('../terra.js')
jest.mock('../astroport.js')
jest.mock('../executes/create-dca-order.js')
jest.mock('./add-address.js')

const mockedTerra = jest.mocked(terra, { shallow: true })
const mockedAstroport = jest.mocked(astroport, { shallow: true })
const mockedAddAddress = jest.mocked(addAddress, { shallow: true })
const mockedCreateDcaOrderExecute = jest.mocked(createDcaOrderExecute, {
  shallow: true,
})

describe('createDcaOrder', () => {
  it('creates dca order from native to token', async () => {
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

    const initial = ['1000', 'uluna']
    const target = 'token_contract_addr'
    const interval = 1000
    const dcaAmount = '100'
    const first = Date.now() / 1000 + 1000
    await createDcaOrder({
      initial,
      target,
      interval,
      dcaAmount,
      first,
    })

    expect(mockedTerra.getKey).toBeCalledTimes(1)
    expect(mockedCreateDcaOrderExecute.default).toBeCalledTimes(1)
    expect(mockedAddAddress.addAddress).toBeCalledTimes(1)
    expect(mockedAddAddress.addAddress).toBeCalledWith(
      TEST_WALLET_ACC_ADDRESS,
      {},
    )
    expect(mockedCreateDcaOrderExecute.default).toBeCalledWith(
      expect.any(Object),
      { info: { native_token: { denom: 'uluna' } }, amount: '1000' },
      { token: { contract_addr: 'token_contract_addr' } },
      1000,
      '100',
      first,
    )
  })

  it('creates dca order from token to native', async () => {
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

    const initial = ['1000', 'token_contract_addr']
    const target = 'uluna'
    const interval = 1000
    const dcaAmount = '100'
    const first = Date.now() / 1000 + 1000
    await createDcaOrder({
      initial,
      target,
      interval,
      dcaAmount,
      first,
    })

    expect(mockedTerra.getKey).toBeCalledTimes(1)
    expect(mockedCreateDcaOrderExecute.default).toBeCalledTimes(1)
    expect(mockedAddAddress.addAddress).toBeCalledTimes(1)
    expect(mockedAddAddress.addAddress).toBeCalledWith(
      TEST_WALLET_ACC_ADDRESS,
      {},
    )
    expect(mockedCreateDcaOrderExecute.default).toBeCalledWith(
      expect.any(Object),
      {
        info: { token: { contract_addr: 'token_contract_addr' } },
        amount: '1000',
      },
      { native_token: { denom: 'uluna' } },
      1000,
      '100',
      first,
    )
  })
})
