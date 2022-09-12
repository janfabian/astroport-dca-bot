import { User } from './types/db.js'
import fs from 'fs'

export const DEFAULT_DB_LOCATION = './db.json'

export function list(location = DEFAULT_DB_LOCATION): User[] {
  let data: string

  try {
    data = fs.readFileSync(location, 'utf8')
  } catch {
    return []
  }

  if (!data) {
    return []
  } else {
    return JSON.parse(data.toString())
  }
}

export function write(user: User, location = DEFAULT_DB_LOCATION) {
  const users = list(location)

  const ix = users.findIndex((u) => u.address === user.address)

  if (ix > -1) {
    users[ix] = user
  } else {
    users.push(user)
  }

  fs.writeFileSync(location, JSON.stringify(users))
}

export function remove(user: User, location = DEFAULT_DB_LOCATION) {
  const users = list(location)

  const ix = users.findIndex((u) => u.address === user.address)

  if (ix > -1) {
    users.splice(ix, 1)
  }

  fs.writeFileSync(location, JSON.stringify(users))
}
