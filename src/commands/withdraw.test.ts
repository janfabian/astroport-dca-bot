import { getMockedLCDClient } from './test-lib.js'
import * as terra from '../terra.js'
import * as astroport from '../astroport.js'
import * as withdrawExecute from '../executes/withdraw.js'
import { withdraw } from './withdraw.js'
import { InvalidArgumentError } from 'commander'

jest.mock('../terra.js')
jest.mock('../astroport.js')
jest.mock('../executes/withdraw.js')

const mockedTerra = jest.mocked(terra, { shallow: true })
const mockedAstroport = jest.mocked(astroport, { shallow: true })
const mockedWithdrawExecute = jest.mocked(withdrawExecute, { shallow: true })

describe('withdraw', () => {
  it('withdraws amounts', async () => {
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

    await withdraw({ assets: ['1000', 'uluna'] })

    expect(mockedTerra.getKey).toBeCalledTimes(1)
    expect(mockedWithdrawExecute.default).toBeCalledTimes(1)
    expect(mockedWithdrawExecute.default).toBeCalledWith(expect.any(Object), [
      {
        amount: '1000',
        info: {
          native_token: {
            denom: 'uluna',
          },
        },
      },
    ])
  })

  it('withdraws multiple amounts', async () => {
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

    await withdraw({
      assets: ['1000', 'uluna', '100', 'random_token_contract_addr'],
    })

    expect(mockedTerra.getKey).toBeCalledTimes(1)
    expect(mockedWithdrawExecute.default).toBeCalledTimes(1)
    expect(mockedWithdrawExecute.default).toBeCalledWith(expect.any(Object), [
      {
        amount: '1000',
        info: {
          native_token: {
            denom: 'uluna',
          },
        },
      },
      {
        amount: '100',
        info: {
          token: {
            contract_addr: 'random_token_contract_addr',
          },
        },
      },
    ])
  })

  it('fails if wrong number of parameters', async () => {
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

    expect.assertions(1)
    try {
      await withdraw({
        assets: ['1000'],
      })
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidArgumentError)
    }
  })
})
