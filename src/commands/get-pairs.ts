import { Command } from 'commander'
import { tryCatch } from '../lib.js'
import { getPairs as getPairsQuery } from '../astroport.js'
import { Pair } from '../types/astroport.js'

export async function getPairs(): Promise<Pair[]> {
  const pairs = await getPairsQuery()

  return pairs
}

export default function getPairsCommand(program: Command) {
  program
    .command('get-pairs')
    .description('Get Astroport pairs')
    .action(tryCatch(getPairs))
}
