export type Pair = {
  asset_infos: AssetInfo[]
  contract_addr: string
  liquidity_token: string
  pair_type: PairType
}

export type AssetInfo = {
  token?: Token
  native_token?: NativeToken
}

export type Token = {
  contract_addr: string
}

export type NativeToken = {
  denom: string
}

export type PairType = {
  xyk?: Xyk
  stable?: Stable
}

export type Xyk = {}
export type Stable = {}

export type Asset = {
  info: AssetInfo
  amount: string
}

export type Order = {
  initial_asset: Asset
  target_asset: AssetInfo
  interval: number
  dca_amount: string
  first_purchase?: number
}

export type DcaQueryInfo = {
  token_allowance: string
  order: Order & {
    id: number
  }
}
