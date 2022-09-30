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
  last_purchase: number
  first_purchase?: number
}

export type DcaQueryInfo = {
  token_allowance: string
  order: Order & {
    id: number
  }
}

export type SwapOperation = {
  [string]: {
    offer_asset_info: AssetInfo
    ask_asset_info: AssetInfo
  }
}

export type ConfigQuery = {
  max_hops: number
  max_spread: string
  whitelisted_fee_assets: Asset[]
  whitelisted_tokens: AssetInfo[]
  factory_addr: string
  router_addr: string
}

export type UserConfigQuery = {
  last_id: number
  max_hops?: number
  max_spread?: spread
  tip_balance: Asset[]
}

export type DenomAmountMap = {
  [key: string]: bigint
}

export type SimulateSwapQuery = {
  amount: string
}
