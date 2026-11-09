import assert from 'node:assert/strict'
import test from 'node:test'
import { dotfilesIn, parsePackOutput } from '../scripts/npm-pack.mjs'

test('npm pack output parses for array and object shapes', () => {
  const packed = { filename: 'x.tgz', files: [{ path: 'a.js' }] }
  assert.equal(parsePackOutput(JSON.stringify([packed])).filename, 'x.tgz')
  assert.equal(parsePackOutput(JSON.stringify({ '@scope/x': packed })).filename, 'x.tgz')
  assert.throws(() => parsePackOutput('{}'), /Unexpected npm pack/)
})

test('dotfilesIn reports dotfiles and files inside dot directories', () => {
  assert.deepEqual(
    dotfilesIn([{ path: 'a.js' }, { path: '.env' }, { path: 'skills/.claude/x.md' }]),
    ['.env', 'skills/.claude/x.md']
  )
  assert.deepEqual(dotfilesIn([{ path: 'a.js' }, { path: 'dir/.hidden/x' }]), ['dir/.hidden/x'])
})
