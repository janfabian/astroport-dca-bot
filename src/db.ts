import { User } from './types/db.js'
import fs from 'fs'
import { resolve } from 'path'

export const DEFAULT_DB_LOCATION = resolve(__dirname, '../db.json')

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

  const ix = users.findIndex((u) => u.pkey === user.pkey)

  if (ix > -1) {
    users[ix] = user
  } else {
    users.push(user)
  }

  fs.writeFileSync(location, JSON.stringify(users))
}
