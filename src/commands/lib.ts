import { InvalidArgumentError, InvalidOptionArgumentError } from 'commander'

export function myParseInt(value: string) {
  // parseInt takes a string and a radix
  const parsedValue = parseInt(value, 10)
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError('Not a number.')
  }
  return parsedValue
}

export function parseInitialAsset(initial: string) {
  const [initialAmount, initialDenom] = initial.split(' ')

  if (!initialAmount || !initialDenom) {
    throw new InvalidOptionArgumentError(
      `Bad parsing of the initial option value, option value provided ${initial}. Required form "[amount] [denom | contract_address]", examples: "100 uluna", "100 token_contract_addr".`,
    )
  }

  return [initialAmount, initialDenom]
}
