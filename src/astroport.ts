import { getLCDClient } from './terra.js'

export const FACTORY = process.env.ASTROPORT_FACTORY as string

export async function* paginated(query, resultKey) {
  let startAfter
  let hasNextPage = true

  while (hasNextPage) {
    const result = await query(startAfter)
    const items = result[resultKey]

    yield items

    startAfter = items[items.length - 1]?.asset_infos
    hasNextPage = Boolean(startAfter)
  }
}

const PAIR_LIMIT = 100

export async function getConfig() {
  const lcd = await getLCDClient()

  return await lcd.wasm.contractQuery(FACTORY, { config: {} })
}

export async function getPairs() {
  const lcd = await getLCDClient()

  let pairs = []

  for await (const items of paginated((startAfter) => {
    return lcd.wasm.contractQuery(FACTORY, {
      pairs: { limit: PAIR_LIMIT, start_after: startAfter },
    })
  }, 'pairs')) {
    pairs = pairs.concat(items)
  }

  return pairs
}
