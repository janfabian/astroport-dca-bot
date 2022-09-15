import { createAssetInfo, swapOpsFromPath } from './lib.js'
import { getLCDClient } from './terra.js'
import { Pair, SimulateSwapQuery, SwapOperation } from './types/astroport.js'

export const FACTORY = process.env.ASTROPORT_FACTORY as string
export const ROUTER = process.env.ASTROPORT_ROUTER as string

export enum TOKEN_TYPE {
  TOKEN = 'TOKEN',
  NATIVE = 'NATIVE',
}

export const DEFAULT_WHITELISTED_TOKENS =
  process.env.DEFAULT_WHITELISTED_TOKENS?.split(',') || []

export async function* paginated(query, resultKey: string) {
  let startAfter
  let hasNextPage = true

  while (hasNextPage) {
    const result = await query(startAfter)
    const items = result?.[resultKey]

    yield items

    if (!items) {
      break
    }

    startAfter = items[items.length - 1]?.asset_infos
    hasNextPage = Boolean(startAfter)
  }
}

const PAIR_LIMIT = 100

export async function getConfig() {
  const lcd = await getLCDClient()

  return await lcd.wasm.contractQuery(FACTORY, { config: {} })
}

export async function getPairs(): Promise<Pair[]> {
  const lcd = await getLCDClient()

  let pairs: Pair[] = []

  for await (const items of paginated((startAfter) => {
    return lcd.wasm.contractQuery(FACTORY, {
      pairs: { limit: PAIR_LIMIT, start_after: startAfter },
    })
  }, 'pairs')) {
    pairs = pairs.concat(items)
  }

  return pairs
}

export async function simulateSwap(
  amount: string,
  path: string[],
  nativeTokens: Set<string>,
): Promise<SimulateSwapQuery> {
  const lcd = await getLCDClient()

  const ops = swapOpsFromPath(path, nativeTokens)

  return await lcd.wasm.contractQuery(ROUTER, {
    simulate_swap_operations: {
      offer_amount: amount,
      operations: ops,
    },
  })
}
