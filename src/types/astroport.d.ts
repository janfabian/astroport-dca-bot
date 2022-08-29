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
