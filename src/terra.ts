import { Coins, LCDClient, MnemonicKey } from '@terra-money/terra.js'

declare let fetch: any

export async function getPricesCoins() {
  const apiEndpoint = process.env.API_ENDPOINT as string
  const gasPrices = await fetch(new URL('gas-prices', apiEndpoint), {
    redirect: 'follow',
  })

  const gasPricesJson = await gasPrices.json()
  const gasPricesCoins = new Coins(gasPricesJson)

  return gasPricesCoins
}

let lcdSingleton: LCDClient

export async function getLCDClient() {
  if (lcdSingleton) {
    return lcdSingleton
  }

  const gasPricesCoins = await getPricesCoins()

  const lcd = new LCDClient({
    URL: process.env.LCD_ENDPOINT as string, // Use "https://phoenix-lcd.terra.dev" for prod "http://localhost:1317" for localterra.
    chainID: process.env.CHAIN_ID as string, // Use "phoenix-1" for production or "localterra".
    gasPrices: gasPricesCoins,
    gasAdjustment: '1.5',
  })

  lcdSingleton = lcd

  return lcd
}

export function getKey() {
  return new MnemonicKey({
    mnemonic: process.env.MNEMONIC,
    coinType: 330,
    account: 0,
    index: 0,
  })
}

export async function getWallet() {
  const key = getKey()
  const terra = await getLCDClient()
  const wallet = terra.wallet(key)

  return wallet
}
