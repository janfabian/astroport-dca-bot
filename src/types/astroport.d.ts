export interface Pair {
  asset_infos: AssetInfo[]
  contract_addr: string
  liquidity_token: string
  pair_type: PairType
}

export interface AssetInfo {
  token?: Token
  native_token?: NativeToken
}

export interface Token {
  contract_addr: string
}

export interface NativeToken {
  denom: string
}

export interface PairType {
  xyk?: Xyk
  stable?: Stable
}

export interface Xyk {}
export interface Stable {}

export interface Asset {
  info: AssetInfo
  amount: string
}

export interface Order {
  initial_asset: Asset
  target_asset: AssetInfo
  interval: number
  dca_amount: string
  first_purchase?: number
}
