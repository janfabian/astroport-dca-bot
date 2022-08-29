import { createGraph, findPaths, Graph } from './lib.js'

describe('createGraph', () => {
  function nativeToken(denom: string) {
    return {
      native_token: {
        denom,
      },
    }
  }

  function token(contractAddr: string) {
    return {
      token: {
        contract_addr: contractAddr,
      },
    }
  }

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
      ['B', new Set(['C', 'D', 'B'])],
      ['C', new Set(['D'])],
      ['D', new Set(['A', 'D'])],
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
})
