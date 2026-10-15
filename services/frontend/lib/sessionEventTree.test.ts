import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildSessionTree } from './sessionEventTree'
import type { RumEvent, VitalEventData } from './sessionMocking.types'

const session: RumEvent = { id: 'session', type: 'session', timestamp: '' }

function view(id: string): RumEvent {
  return { id, type: 'view', timestamp: '', count: 1, data: { url: `/${id}` }, viewId: id }
}

function action(id: string, viewId: string): RumEvent {
  return { id, type: 'action', timestamp: '', data: { name: id }, viewId }
}

function vital(id: string, viewId: string, data: VitalEventData): RumEvent {
  return { id, type: 'vital', timestamp: '', data, viewId }
}

function operationStep(id: string, viewId: string, data: Partial<VitalEventData>): RumEvent {
  return vital(id, viewId, { name: 'checkout.submit_order', vitalType: 'operation_step', ...data })
}

/** Flattens the tree to ids so the expected shape reads at a glance. */
function shape(events: RumEvent[]) {
  const tree = buildSessionTree(events)
  return tree.children.map(node =>
    node.kind === 'operation'
      ? node.event.id
      : { [node.view.id]: node.children.map(child => child.id) }
  )
}

describe('buildSessionTree', () => {
  it('places a successful operation under the session, between the views around it', () => {
    const events = [
      session,
      view('cart'),
      action('click-checkout', 'cart'),
      view('checkout'),
      operationStep('op-end', 'checkout', { stepType: 'end' }),
      view('confirmation'),
    ]

    assert.deepEqual(shape(events), [
      { cart: ['click-checkout'] },
      { checkout: [] },
      'op-end',
      { confirmation: [] },
    ])
  })

  it('keeps adding later view events to the view, above the operation', () => {
    const events = [
      session,
      view('checkout'),
      operationStep('op-end', 'checkout', { stepType: 'end' }),
      action('click-continue', 'checkout'),
    ]

    assert.deepEqual(shape(events), [{ checkout: ['click-continue'] }, 'op-end'])
  })

  it('leaves out operation start steps and failed end steps', () => {
    const events = [
      session,
      view('checkout'),
      operationStep('op-start', 'checkout', { stepType: 'start' }),
      operationStep('op-failed', 'checkout', { stepType: 'end', failureReason: 'error' }),
    ]

    assert.deepEqual(shape(events), [{ checkout: [] }])
  })

  it('keeps custom duration vitals under their view', () => {
    const events = [
      session,
      view('home'),
      vital('ad-vital', 'home', { name: 'ad', vitalType: 'duration', duration: 1e6 }),
    ]

    assert.deepEqual(shape(events), [{ home: ['ad-vital'] }])
  })
})
