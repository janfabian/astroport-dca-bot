import { getMockedLCDClient } from './test-lib.js'
import * as terra from '../terra.js'
import * as astroport from '../astroport.js'
import * as addBotTipExecute from '../executes/add-bot-tip.js'
import { addBotTip } from './add-bot-tip.js'
import { InvalidArgumentError } from 'commander'

jest.mock('../terra.js')
jest.mock('../astroport.js')
jest.mock('../executes/add-bot-tip.js')

const mockedTerra = jest.mocked(terra, { shallow: true })
const mockedAstroport = jest.mocked(astroport, { shallow: true })
const mockedAddBotTipExecute = jest.mocked(addBotTipExecute, { shallow: true })

describe('addBotTip', () => {
  it('adds funds for bot tip fees', async () => {
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

    await addBotTip({ assets: ['1000', 'uluna'] })

    expect(mockedTerra.getKey).toBeCalledTimes(1)
    expect(mockedAddBotTipExecute.default).toBeCalledTimes(1)
    expect(mockedAddBotTipExecute.default).toBeCalledWith(expect.any(Object), [
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

  it('adds multiple assets', async () => {
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

    await addBotTip({
      assets: ['1000', 'uluna', '100', 'random_token_contract_addr'],
    })

    expect(mockedTerra.getKey).toBeCalledTimes(1)
    expect(mockedAddBotTipExecute.default).toBeCalledTimes(1)
    expect(mockedAddBotTipExecute.default).toBeCalledWith(expect.any(Object), [
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

    expect.assertions(1)
    try {
      await addBotTip({
        assets: ['1000'],
      })
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidArgumentError)
    }
  })
})
