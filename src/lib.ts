import { inspect } from 'util'
import { DEFAULT_WHITELISTED_TOKENS } from './astroport.js'
import {
  Asset,
  AssetInfo,
  DenomAmountMap,
  Pair,
  SwapOperation,
} from './types/astroport.js'

export type Graph = Map<string, Set<string>>
export type Path = string[]

export function getNativeTokens(pairs: Pair[]) {
  return new Set(
    pairs
      .flatMap((p) => p.asset_infos.map((a) => a.native_token?.denom))
      .filter(Boolean) as string[],
  )
}

export function isNativeToken(assetInfo: AssetInfo) {
  return Boolean(assetInfo.native_token?.denom)
}

export function nativeToken(denom: string) {
  return {
    native_token: {
      denom: denom,
    },
  }
}

export function token(contractAddr: string) {
  return {
    token: {
      contract_addr: contractAddr,
    },
  }
}

export function createAssetInfo(
  denom: string,
  nativeTokens: Set<string>,
): AssetInfo {
  return nativeTokens.has(denom) ? nativeToken(denom) : token(denom)
}

export function getDenom(assetInfo: AssetInfo) {
  return (assetInfo.native_token?.denom ||
    assetInfo.token?.contract_addr) as string
}

export function fromAssetListToMap(assetList: Asset[]): DenomAmountMap {
  return assetList.reduce((acc, asset) => {
    return { ...acc, [getDenom(asset.info)]: asset.amount }
  }, {})
}

export function fromMapToAssetList(
  assetMap: DenomAmountMap,
  nativeTokens: Set<string>,
): Asset[] {
  return Object.entries(assetMap).map(([denom, amount]) => ({
    info: createAssetInfo(denom, nativeTokens),
    amount: amount.toString(),
  }))
}

export function feeRedeem(
  whitelistedFees: DenomAmountMap,
  tipBalanceOriginal: DenomAmountMap,
  hops: number,
  preferedFeeDenom: string[] = [],
): DenomAmountMap[] | null {
  const tipBalance = { ...tipBalanceOriginal }
  const whitelistedDenoms = Object.keys(whitelistedFees)
  const tipBalanceDenoms = Object.keys(tipBalance)

  let denoms = preferedFeeDenom.filter((denom) =>
    whitelistedDenoms.includes(denom),
  )

  denoms = denoms
    .concat(whitelistedDenoms)
    .filter((denom, pos, a) => a.indexOf(denom) === pos)
    .filter((denom) => tipBalanceDenoms.includes(denom))

  let i_hop = 0
  let i_d = 0
  const result: DenomAmountMap[] = []

  while (i_hop < hops) {
    const denom = denoms[i_d]
    if (!denom) {
      break
    }

    const feeAmount = whitelistedFees[denom]
    const tipBalanceAfter = tipBalance[denom] - feeAmount

    if (tipBalanceAfter >= 0n) {
      tipBalance[denom] = tipBalanceAfter
      i_hop++
      result.push({ [denom]: feeAmount })
    } else {
      i_d++
    }
  }

  if (result.length !== hops) {
    return null
  }

  return result
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
  const edges_names: string[][] = [[]]

  while (toVisit.length > 0 && paths.length > 0) {
    const node = toVisit.shift() as string
    let edges_name = edges_names.shift() as string[]
    let path = paths.shift() as string[]
    const previous = path[path.length - 1]
    const edge = previous ? previous + '_' + node : null

    path = [...path, node]

    if (edge) {
      edges_name = [...edges_name, edge]
    }

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
      if (node === neighbour) {
        continue
      }

      if (edges_name.includes(node + '_' + neighbour)) {
        continue
      }

      edges_names.push(edges_name)
      toVisit.push(neighbour)
      paths.push(path)
    }
  }
}

export function swapOpsFromPath(
  path: string[],
  nativeTokens: Set<string>,
  swapKeyname = 'astro_swap',
): SwapOperation[] {
  const ops = path
    .map((_node, ix) => path.slice(ix, ix + 2))
    .slice(0, -1)
    .map((hop) => {
      const offer = hop[0]
      const ask = hop[1]

      return {
        [swapKeyname]: {
          offer_asset_info: createAssetInfo(offer, nativeTokens),
          ask_asset_info: createAssetInfo(ask, nativeTokens),
        },
      }
    })

  return ops
}

export function tryCatch(fn) {
  return async function (...args) {
    try {
      const result = await fn(...args)

      if (result) {
        console.log(inspect(result, false, null))
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e.response?.data) {
        console.error(e.response?.data)
      } else {
        console.error(e)
      }

      throw e
    }
  }
}
