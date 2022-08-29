import { DEFAULT_WHITELISTED_TOKENS } from './astroport.js'
import { Pair } from './types/astroport.js'

export type Graph = Map<string, Set<string>>
export type Path = string[]

export function getNativeTokens(pairs: Pair[]) {
  return new Set(
    pairs
      .flatMap((p) => p.asset_infos.map((a) => a.native_token?.denom))
      .filter(Boolean) as string[],
  )
}

export function createGraph(pairs: Pair[]) {
  const graph: Graph = new Map()

  pairs.forEach((p) => {
    const token1 =
      p.asset_infos?.[0]?.token?.contract_addr ||
      p.asset_infos?.[0]?.native_token?.denom

    const token2 =
      p.asset_infos?.[1]?.token?.contract_addr ||
      p.asset_infos?.[1]?.native_token?.denom

    if (!token1 || !token2) {
      return
    }

    const token1Neighbours = graph.get(token1) || new Set<string>()
    token1Neighbours.add(token2)
    graph.set(token1, token1Neighbours)

    const token2Neighbours = graph.get(token2) || new Set<string>()
    token2Neighbours.add(token1)
    graph.set(token2, token2Neighbours)
  })

  return graph
}

export function* findPaths(
  graph: Graph,
  from: string,
  to: string,
  maxHops: number,
  whitelisted: Set<string>,
) {
  whitelisted.add(from)
  for (const t of DEFAULT_WHITELISTED_TOKENS) {
    whitelisted.add(t)
  }

  const start = graph.get(from)

  if (!start) {
    return
  }

  const paths: string[][] = [[]]
  const toVisit = [from]

  while (toVisit.length > 0 && paths.length > 0) {
    const node = toVisit.shift() as string
    let path = paths.shift() as string[]

    path = [...path, node]

    if (node === to) {
      yield path
    }

    if (!whitelisted.has(node)) {
      continue
    }

    if (path.length - 1 >= maxHops) {
      continue
    }

    const neighbours = graph.get(node) || new Set()

    for (const neighbour of neighbours) {
      if (path.includes(neighbour)) {
        continue
      }

      toVisit.push(neighbour)
      paths.push(path)
    }
  }
}
