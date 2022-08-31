export default function getUserDcaOrders(user: string) {
  return {
    user_dca_orders: { user },
  }
}
