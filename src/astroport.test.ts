import { paginated } from './astroport.js'

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
})
