import { Command, InvalidOptionArgumentError } from 'commander'
import { getNativeTokens, tryCatch } from '../lib.js'
import { getKey, getLCDClient } from '../terra.js'
import { getPairs } from '../astroport.js'
import { nativeToken, token } from '../lib.js'
import { Asset } from '../types/astroport.js'
import addBotTipExecute from '../executes/add-bot-tip.js'

export async function addBotTip(options) {
  const optionAssets: string[] = options.assets

  if (optionAssets.length % 2 !== 0) {
    throw new InvalidOptionArgumentError(
      `Wrong number of assets params, example -a 1 uluna 100 astro_contract_add ...`,
    )
  }

  const k = getKey()
  const terra = await getLCDClient()
  const wallet = terra.wallet(k)

  const pairs = await getPairs()
  const nativeTokens = getNativeTokens(pairs)

  const assets: Asset[] = []

  for (let i = 0; i < optionAssets.length; i += 2) {
    const [amount, denom] = optionAssets.slice(i, i + 2)
    const asset: Asset = {
      amount: amount,
      info: nativeTokens.has(denom) ? nativeToken(denom) : token(denom),
    }
    assets.push(asset)
  }

  const msgs = addBotTipExecute(wallet, assets)

  const executeTx = await wallet.createAndSignTx({
    msgs: msgs,
  })

  const executeTxResult = await terra.tx.broadcast(executeTx)

  return executeTxResult
}

export default function addBotTipCommand(program: Command) {
  program
    .command('add-bot-tip')
    .description('Adds funds for DCA purchases bot fees')
    .requiredOption(
      '-a, --assets <strings...>',
      'bot fee asset info, ex. 100 uluna',
    )
    .action(tryCatch(addBotTip))
}
