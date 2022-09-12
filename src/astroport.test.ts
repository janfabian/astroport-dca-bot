import { paginated, swapOpsFromPath } from './astroport.js'

describe('astroport', () => {
  describe('paginated', () => {
    it('returns paginated result', async () => {
      const queryKey = 'result'
      const assetExampleInfo = 'assetExampleInfo'
      const query = jest
        .fn()
        .mockResolvedValueOnce({
          [queryKey]: [{ asset_infos: assetExampleInfo }],
        })
        .mockResolvedValueOnce({
          [queryKey]: [{ asset_infos: assetExampleInfo + '2' }],
        })

      const result: any[] = []
      for await (const item of paginated(query, queryKey)) {
        result.push(item)
      }

      expect(result).toEqual([
        [{ asset_infos: 'assetExampleInfo' }],
        [{ asset_infos: 'assetExampleInfo2' }],
      ])
    })
  })

  describe('swapOpsFromPath', () => {
    it('returns empty list', () => {
      const path = []
      const nativeTokens = new Set(['uluna'])

      const result = swapOpsFromPath(path, nativeTokens)

      expect(result).toEqual([])
    })

    it('returns single hop', () => {
      const path = ['uluna', 'axlUSDC']
      const nativeTokens = new Set(['uluna'])

      const result = swapOpsFromPath(path, nativeTokens)

      expect(result).toEqual([
        {
          astro_swap: {
            offer_asset_info: {
              native_token: {
                denom: 'uluna',
              },
            },
            ask_asset_info: {
              token: {
                contract_addr: 'axlUSDC',
              },
            },
          },
        },
      ])
    })

    it('returns multihop', () => {
      const path = ['uluna', 'axlUSDC', 'some_contract_addr']
      const nativeTokens = new Set(['uluna', 'axlUSDC'])

      const result = swapOpsFromPath(path, nativeTokens)

      expect(result).toEqual([
        {
          astro_swap: {
            offer_asset_info: {
              native_token: {
                denom: 'uluna',
              },
            },
            ask_asset_info: {
              native_token: {
                denom: 'axlUSDC',
              },
            },
          },
        },
        {
          astro_swap: {
            offer_asset_info: {
              native_token: {
                denom: 'axlUSDC',
              },
            },
            ask_asset_info: {
              token: {
                contract_addr: 'some_contract_addr',
              },
            },
          },
        },
      ])
    })
  })
})
