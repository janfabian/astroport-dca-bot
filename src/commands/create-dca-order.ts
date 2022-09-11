import { Command, InvalidOptionArgumentError } from 'commander'
import { getNativeTokens, tryCatch } from '../lib.js'
import { getKey, getLCDClient } from '../terra.js'
import createDcaOrderExecute from '../executes/create-dca-order.js'
import { addAddress } from './add-address.js'
import { getPairs } from '../astroport.js'
import { nativeToken, token } from '../lib.js'
import { myParseInt } from './lib.js'

export async function createDcaOrder(options) {
  const k = getKey()
  const terra = await getLCDClient()
  const wallet = terra.wallet(k)

  const pairs = await getPairs()
  const nativeTokens = getNativeTokens(pairs)

  const [initialAmount, initialDenom] = options.initial

  const target = options.target

  const msgs = createDcaOrderExecute(
    wallet,
    {
      info: nativeTokens.has(initialDenom)
        ? nativeToken(initialDenom)
        : token(initialDenom),
      amount: initialAmount,
    },
    nativeTokens.has(target) ? nativeToken(target) : token(target),
    options.interval,
    options.dcaAmount,
    options.first,
  )

  const executeTx = await wallet.createAndSignTx({
    msgs: msgs,
  })

  const executeTxResult = await terra.tx.broadcast(executeTx)

  await addAddress(wallet.key.accAddress, {})

  return executeTxResult
}

export function parseInitialAsset(initial: string) {
  const [initialAmount, initialDenom] = initial.split(' ')

  if (!initialAmount || !initialDenom) {
    throw new InvalidOptionArgumentError(
      `Bad parsing of the initial option value, option value provided ${initial}. Required form "[amount] [denom | contract_address]", examples: 100 uluna, 100 token_contract_addr.`,
    )
  }

  return [initialAmount, initialDenom]
}

export default function createDcaOrderCommand(program: Command) {
  program
    .command('create-order')
    .description('Create an order for the currently used env variable MNEMONIC')
    .requiredOption(
      '-i, --initial <string>',
      'initial asset info, ex. 100 uluna',
      parseInitialAsset,
    )
    .requiredOption('-t, --target <string>', 'target asset denom')
    .requiredOption(
      '-n, --interval <number>',
      'minimal interval between purchases in seconds',
      myParseInt,
    )
    .requiredOption('-a, --dca-amount <string>', 'dca amount')
    .option(
      '-f, --first <number>',
      'first dca purchase possible after seconds',
      myParseInt,
    )
    .action(tryCatch(createDcaOrder))
}
