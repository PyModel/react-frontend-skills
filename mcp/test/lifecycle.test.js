import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import test from 'node:test'
import { closeOnSignals } from '../src/lifecycle.js'

function harness(onClose = async () => {}) {
  const proc = new EventEmitter()
  const errors = []
  const server = {
    closed: 0,
    async close() {
      this.closed++
      await onClose()
    },
  }
  closeOnSignals(server, { proc, onError: (signal, error) => errors.push([signal, error]) })
  return { proc, server, errors }
}

test('SIGTERM closes the server once and exits 0', async () => {
  const { proc, server } = harness()

  proc.emit('SIGTERM')
  await new Promise(setImmediate)
  assert.equal(server.closed, 1)
  assert.equal(proc.exitCode, 0)

  proc.emit('SIGINT')
  await new Promise(setImmediate)
  assert.equal(server.closed, 1, 'a second signal does not close the server again')
})

test('a failed close reports the signal and exits 1', async () => {
  const failure = new Error('boom')
  const { proc, errors } = harness(async () => {
    throw failure
  })

  proc.emit('SIGTERM')
  await new Promise(setImmediate)
  assert.equal(proc.exitCode, 1)
  assert.deepEqual(errors, [['SIGTERM', failure]])
})
