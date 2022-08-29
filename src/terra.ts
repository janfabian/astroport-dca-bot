import { Coins, LCDClient } from '@terra-money/terra.js'

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
    chainID: 'pisco-1', // Use "phoenix-1" for production or "localterra".
    gasPrices: gasPricesCoins,
    gasAdjustment: '1.5',
    //@ts-ignore
    gas: 10000000,
  })

  lcdSingleton = lcd

  return lcd
}
