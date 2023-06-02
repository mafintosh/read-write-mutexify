const test = require('brittle')
const RW = require('./')

test('as many reads as you want', async function (t) {
  const lock = new RW()

  const r1 = await lock.read()
  const r2 = await lock.read()

  t.pass('didnt dead lock')

  r1()
  r2()
})

test('only one read at the time', async function (t) {
  t.plan(1)

  const lock = new RW()

  let released = false
  const release = await lock.write()

  lock.write().then(() => {
    t.ok(released, 'only one writer active')
  })

  await new Promise(resolve => setImmediate(resolve))

  release()
  released = true
})

test('reads waits for writer', async function (t) {
  t.plan(1)

  const lock = new RW()

  let released = false
  const release = await lock.write()

  lock.read().then(() => {
    t.ok(released, 'read waited for writer')
  })

  await new Promise(resolve => setImmediate(resolve))

  release()
  released = true
})

test('writer waits for all reads', async function (t) {
  t.plan(1)

  const lock = new RW()

  let released = false
  const r1 = await lock.read()
  const r2 = await lock.read()

  lock.write().then(() => {
    t.ok(released, 'write waited for all readers')
  })

  await new Promise(resolve => setImmediate(resolve))

  r1()

  await new Promise(resolve => setImmediate(resolve))

  r2()
  released = true
})
