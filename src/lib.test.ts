import {
  fromMapToAssetList,
  nativeToken,
  swapOpsFromPath,
  token,
} from './lib.js'
import {
  createGraph,
  feeRedeem,
  findPaths,
  fromAssetListToMap,
  getNativeTokens,
  Graph,
} from './lib.js'

describe('lib', () => {
  describe('getNativeTokens', () => {
    it('returns empty', () => {
      const pairs = []

      const nativeTokens = getNativeTokens(pairs)

      expect(nativeTokens).toEqual(new Set())
    })

    it('returns single mixed pair native tokens', () => {
      const pairs = [
        {
          asset_infos: [nativeToken('uluna'), token('addr')],
          contract_addr: 'contract_addr',
          liquidity_token: 'liquidity_token',
          pair_type: {},
        },
      ]

      const nativeTokens = getNativeTokens(pairs)

      expect(nativeTokens).toEqual(new Set(['uluna']))
    })

    it('returns multiple pairs native tokens', () => {
      const pairs = [
        {
          asset_infos: [nativeToken('uluna'), token('addr')],
          contract_addr: 'contract_addr',
          liquidity_token: 'liquidity_token',
          pair_type: {},
        },
        {
          asset_infos: [nativeToken('uluna'), nativeToken('uluna2')],
          contract_addr: 'contract_addr',
          liquidity_token: 'liquidity_token',
          pair_type: {},
        },
      ]

      const nativeTokens = getNativeTokens(pairs)

      expect(nativeTokens).toEqual(new Set(['uluna', 'uluna2']))
    })
  })

  describe('fromAssetListToMap', () => {
    it('returns empty', () => {
      const assetList = []

      const assetMap = fromAssetListToMap(assetList)

      expect(assetMap).toEqual({})
    })

    it('native and contract', () => {
      const assetList = [
        { info: nativeToken('uluna'), amount: '1000' },
        { info: token('addr'), amount: '100' },
      ]

      const assetMap = fromAssetListToMap(assetList)

      expect(assetMap).toEqual({ uluna: '1000', addr: '100' })
    })
  })

  describe('fromMapToAssetList', () => {
    it('returns empty', () => {
      const asset = {}
      const nativeTokens = new Set([])

      const assetList = fromMapToAssetList(asset, nativeTokens)

      expect(assetList).toEqual([])
    })

    it('native and contract', () => {
      const asset = { uluna: BigInt('1000'), addr: BigInt('100') }
      const nativeTokens = new Set(['uluna'])

      const assetList = fromMapToAssetList(asset, nativeTokens)

      expect(assetList).toEqual([
        { info: nativeToken('uluna'), amount: '1000' },
        { info: token('addr'), amount: '100' },
      ])
    })
  })

  describe('feeRedeem', () => {
    it('returns empty', () => {
      const whitelistedFees = {}
      const tipBalance = {}
      const hops = 0
      const preferedFeeDenom = []

      const fees = feeRedeem(
        whitelistedFees,
        tipBalance,
        hops,
        preferedFeeDenom,
      )

      expect(fees).toEqual([])
    })

    it('single fee asset', () => {
      const whitelistedFees = { uluna: BigInt(1) }
      const tipBalance = { uluna: BigInt(100) }
      const hops = 3
      const preferedFeeDenom = []

      const fees = feeRedeem(
        whitelistedFees,
        tipBalance,
        hops,
        preferedFeeDenom,
      )

      expect(fees).toEqual([
        { uluna: BigInt(1) },
        { uluna: BigInt(1) },
        { uluna: BigInt(1) },
      ])
    })

    it('multiple fee asset', () => {
      const whitelistedFees = { uluna: BigInt(1), axlUSDC: BigInt(2) }
      const tipBalance = { uluna: BigInt(1), axlUSDC: BigInt(4) }
      const hops = 3
      const preferedFeeDenom = []

      const fees = feeRedeem(
        whitelistedFees,
        tipBalance,
        hops,
        preferedFeeDenom,
      )

      expect(fees).toEqual([
        { uluna: BigInt(1) },
        { axlUSDC: BigInt(2) },
        { axlUSDC: BigInt(2) },
      ])
    })

    it('multiple fee asset preferred', () => {
      const whitelistedFees = { uluna: BigInt(1), axlUSDC: BigInt(2) }
      const tipBalance = { uluna: BigInt(10), axlUSDC: BigInt(10) }
      const hops = 3
      const preferedFeeDenom = ['axlUSDC']

      const fees = feeRedeem(
        whitelistedFees,
        tipBalance,
        hops,
        preferedFeeDenom,
      )

      expect(fees).toEqual([
        { axlUSDC: BigInt(2) },
        { axlUSDC: BigInt(2) },
        { axlUSDC: BigInt(2) },
      ])
    })

    it('multiple fee asset preferred multiple', () => {
      const whitelistedFees = { uluna: BigInt(1), axlUSDC: BigInt(2) }
      const tipBalance = { uluna: BigInt(10), axlUSDC: BigInt(2) }
      const hops = 3
      const preferedFeeDenom = ['axlUSDC', 'uluna']

      const fees = feeRedeem(
        whitelistedFees,
        tipBalance,
        hops,
        preferedFeeDenom,
      )

      expect(fees).toEqual([
        { axlUSDC: BigInt(2) },
        { uluna: BigInt(1) },
        { uluna: BigInt(1) },
      ])
    })

    it('not enough asset', () => {
      const whitelistedFees = { uluna: BigInt(1), axlUSDC: BigInt(2) }
      const tipBalance = { uluna: BigInt(0) }
      const hops = 1
      const preferedFeeDenom = []

      const fees = feeRedeem(
        whitelistedFees,
        tipBalance,
        hops,
        preferedFeeDenom,
      )

      expect(fees).toEqual(null)
    })

    it('not enough asset multiple', () => {
      const whitelistedFees = { uluna: BigInt(1), axlUSDC: BigInt(2) }
      const tipBalance = { uluna: BigInt(4), axlUSDC: BigInt(1) }
      const hops = 5
      const preferedFeeDenom = []

      const fees = feeRedeem(
        whitelistedFees,
        tipBalance,
        hops,
        preferedFeeDenom,
      )

      expect(fees).toEqual(null)
    })

  })

  describe('createGraph', () => {
    it('creates empty graph', () => {
      const pairs = []

      const graph = createGraph(pairs)

      expect(graph).toEqual(new Map())
    })

    it('creates single mixed pair graph', () => {
      const pairs = [
        {
          asset_infos: [nativeToken('uluna'), token('addr')],
          contract_addr: 'contract_addr',
          liquidity_token: 'liquidity_token',
          pair_type: {},
        },
      ]

      const graph = createGraph(pairs)

      expect(graph).toEqual(
        new Map([
          ['uluna', new Set(['addr'])],
          ['addr', new Set(['uluna'])],
        ]),
      )
    })

    it('creates single native pair graph', () => {
      const pairs = [
        {
          asset_infos: [nativeToken('uluna'), nativeToken('uusd')],
          contract_addr: 'contract_addr',
          liquidity_token: 'liquidity_token',
          pair_type: {},
        },
      ]

      const graph = createGraph(pairs)

      expect(graph).toEqual(
        new Map([
          ['uluna', new Set(['uusd'])],
          ['uusd', new Set(['uluna'])],
        ]),
      )
    })

    it('doesnt create if one token is missing', () => {
      const pairs = [
        {
          asset_infos: [nativeToken('uluna')],
          contract_addr: 'contract_addr',
          liquidity_token: 'liquidity_token',
          pair_type: {},
        },
      ]

      const graph = createGraph(pairs)

      expect(graph).toEqual(new Map())
    })
  })

  describe('findPaths', () => {
    it('returns empty path if start', () => {
      const graph: Graph = new Map()
      const from = 'A'
      const to = 'B'
      const maxHops = 32
      const whitelisted = new Set<string>()

      const result = [...findPaths(graph, from, to, maxHops, whitelisted)]

      expect(result).toHaveLength(0)
    })

    it('single path', () => {
      const graph: Graph = new Map([['A', new Set(['B'])]])
      const from = 'A'
      const to = 'B'
      const maxHops = 32
      const whitelisted = new Set<string>()

      const result = [...findPaths(graph, from, to, maxHops, whitelisted)]

      expect(result).toEqual([['A', 'B']])
    })

    it('two-hops route', () => {
      const graph: Graph = new Map([
        ['A', new Set(['B'])],
        ['B', new Set(['C'])],
      ])
      const from = 'A'
      const to = 'C'
      const maxHops = 32
      const whitelisted = new Set<string>(['B'])

      const result = [...findPaths(graph, from, to, maxHops, whitelisted)]

      expect(result).toEqual([['A', 'B', 'C']])
    })

    it('two-hops route if not whitelisted', () => {
      const graph: Graph = new Map([
        ['A', new Set(['B'])],
        ['B', new Set(['C'])],
      ])
      const from = 'A'
      const to = 'C'
      const maxHops = 32
      const whitelisted = new Set<string>()

      const result = [...findPaths(graph, from, to, maxHops, whitelisted)]

      expect(result).toHaveLength(0)
    })

    it('multiples routes', () => {
      const graph: Graph = new Map([
        ['A', new Set(['B', 'D'])],
        ['B', new Set(['C', 'D'])],
        ['C', new Set(['D'])],
      ])
      const from = 'A'
      const to = 'D'
      const maxHops = 32
      const whitelisted = new Set<string>(['B', 'C'])

      const result = [...findPaths(graph, from, to, maxHops, whitelisted)]

      expect(result).toEqual(
        expect.arrayContaining([
          ['A', 'D'],
          ['A', 'B', 'D'],
          ['A', 'B', 'C', 'D'],
        ]),
      )
    })

    it('multiples routes limited hops', () => {
      const graph: Graph = new Map([
        ['A', new Set(['B', 'D'])],
        ['B', new Set(['C', 'D'])],
        ['C', new Set(['D'])],
      ])
      const from = 'A'
      const to = 'D'
      const maxHops = 1
      const whitelisted = new Set<string>(['B', 'C'])

      const result = [...findPaths(graph, from, to, maxHops, whitelisted)]

      expect(result).toEqual(expect.arrayContaining([['A', 'D']]))
    })

    it('multiples routes without whilisted some', () => {
      const graph: Graph = new Map([
        ['A', new Set(['B', 'D'])],
        ['B', new Set(['C', 'D'])],
        ['C', new Set(['D'])],
      ])
      const from = 'A'
      const to = 'D'
      const maxHops = 32
      const whitelisted = new Set<string>(['B'])

      const result = [...findPaths(graph, from, to, maxHops, whitelisted)]

      expect(result).toEqual(
        expect.arrayContaining([
          ['A', 'D'],
          ['A', 'B', 'D'],
        ]),
      )
    })

    it('multiples routes with circle', () => {
      const graph: Graph = new Map([
        ['A', new Set(['B', 'D', 'A'])],
        ['B', new Set(['C', 'D', 'B', 'A'])],
        ['C', new Set(['D'])],
        ['D', new Set(['A', 'D'])],
      ])
      const from = 'A'
      const to = 'D'
      const maxHops = 10
      const whitelisted = new Set<string>(['B', 'C'])

      const result = [...findPaths(graph, from, to, maxHops, whitelisted)]

      expect(result).toEqual(
        expect.arrayContaining([
          ['A', 'D'],
          ['A', 'B', 'D'],
          ['A', 'B', 'C', 'D'],
        ]),
      )
    })

    it('multiples routes with dead ends', () => {
      const graph: Graph = new Map([
        ['A', new Set(['B', 'D'])],
        ['B', new Set(['C', 'D'])],
        ['D', new Set(['A'])],
      ])
      const from = 'A'
      const to = 'D'
      const maxHops = 32
      const whitelisted = new Set<string>(['B', 'C'])

      const result = [...findPaths(graph, from, to, maxHops, whitelisted)]

      expect(result).toEqual(
        expect.arrayContaining([
          ['A', 'D'],
          ['A', 'B', 'D'],
        ]),
      )
    })

    it('multiples routes with dead ends', () => {
      const graph: Graph = new Map([
        ['A', new Set(['B', 'C', 'E'])],
        ['B', new Set(['A'])],
        ['C', new Set(['A'])],
      ])
      const from = 'A'
      const to = 'E'
      const maxHops = 32
      const whitelisted = new Set<string>(['A', 'B', 'C'])

      const result = [...findPaths(graph, from, to, maxHops, whitelisted)]

      expect(result).toEqual(
        expect.arrayContaining([
          ['A', 'E'],
          ['A', 'B', 'A', 'E'],
          ['A', 'C', 'A', 'E'],
          ['A', 'B', 'A', 'C', 'A', 'E'],
          ['A', 'C', 'A', 'B', 'A', 'E'],
        ]),
      )
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
