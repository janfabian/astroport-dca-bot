import { unlinkSync, writeFileSync } from 'fs'
import { list, write } from './db.js'

describe('db', () => {
  describe('list', () => {
    it('nonexisting db', () => {
      const result = list('__list_nonexisting.json')

      expect(result).toEqual([])
    })

    it('empty db', () => {
      const file = '__list_testemptydb.json'
      writeFileSync(file, '')
      const result = list(file)
      unlinkSync(file)

      expect(result).toEqual([])
    })

    it('db', () => {
      const data = [{ test: 'data' }]
      const file = '__list_testdb.json'
      writeFileSync(file, JSON.stringify(data))
      const result = list(file)
      unlinkSync(file)

      expect(result).toEqual(data)
    })
  })

  describe('write', () => {
    it('nonexisting db', () => {
      const file = '__write_nonexisting.json'
      const user = { address: 'pkey' }
      write(user, file)

      const result = list(file)
      unlinkSync(file)

      expect(result).toEqual([user])
    })

    it('empty db', () => {
      const file = '__write_testemptydb.json'
      writeFileSync(file, '')
      const user = { address: 'pkey' }
      write(user, file)

      const result = list(file)
      unlinkSync(file)

      expect(result).toEqual([user])
    })

    it('db new item', () => {
      const data = [{ address: 'pkey1' }]
      const file = '__write_testdb_new.json'
      writeFileSync(file, JSON.stringify(data))

      const user = { address: 'pkey2' }
      write(user, file)
      const result = list(file)

      unlinkSync(file)

      expect(result).toEqual([...data, user])
    })

    it('db update item', () => {
      const data = [{ address: 'pkey1' }]
      const file = '__write_testdb_update.json'
      writeFileSync(file, JSON.stringify(data))

      const user = { address: 'pkey1', orderIds: [1] }
      write(user, file)
      const result = list(file)

      unlinkSync(file)

      expect(result).toEqual([user])
    })
  })
})
