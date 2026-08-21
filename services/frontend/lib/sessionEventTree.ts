import type { RumEvent, SessionRumEvent, ViewRumEvent } from './sessionMocking.types'

export interface ViewGroup {
  view: ViewRumEvent
  children: RumEvent[]
}

export interface SessionTree {
  session: SessionRumEvent | null
  views: ViewGroup[]
}

export function buildSessionTree(events: RumEvent[]): SessionTree {
  const tree: SessionTree = { session: null, views: [] }

  for (const event of events) {
    if (event.type === 'session') {
      tree.session = event
      continue
    }

    if (event.type === 'view') {
      tree.views.push({ view: event, children: [] })
      continue
    }

    const targetGroup =
      tree.views.find(group => group.view.viewId && group.view.viewId === event.viewId) ??
      tree.views[tree.views.length - 1]

    if (targetGroup) {
      targetGroup.children.push(event)
    }
  }

  return tree
}
