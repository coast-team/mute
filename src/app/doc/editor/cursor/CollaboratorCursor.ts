import * as CodeMirror from 'codemirror'

import { RichCollaborator } from '../../rich-collaborators/'

let lineHeight: number

export class CollaboratorCursor {
  private selectionCSS: string
  private color: string
  private cm: CodeMirror.Editor

  // Attributes for cursor and selection
  private bookmark: { find: () => CodeMirror.Position; clear: () => void } | undefined
  private selection: CodeMirror.TextMarker | undefined
  private cursor: HTMLElement
  private cursorBookmark: HTMLElement
  private cursorTransition: HTMLElement
  private transitionPos: { line: number; ch: number } | undefined
  private nextPos: { line: number; ch: number } | undefined
  private cursorHeight: string | undefined
  private cursorMarginTop: string | undefined

  // Attributes for display name
  private displayName: HTMLElement
  private displayNameWidth: string
  private displayNameTimeout: any

  constructor(cm: CodeMirror.Editor, collab: RichCollaborator) {
    this.cm = cm
    this.color = collab.color
    this.selectionCSS = `opacity: .3; background-color: ${collab.color};`

    // HTML element for display name
    this.displayName = document.createElement('span')
    this.displayName.className = 'collaborator-display-name mat-elevation-z2'
    this.displayName.style.backgroundColor = 'var(--theme-bg-background)'
    this.displayName.style.borderStyle = 'solid'
    this.displayName.style.borderColor = collab.color
    this.displayName.style.borderWidth = '0'
    this.displayName.style.width = '0'
    this.updateDisplayName(collab.displayName)

    // HTML element for cursor
    this.cursor = document.createElement('span')
    this.cursor.className = 'collaborator-cursor mat-elevation-z2'
    this.cursor.style.borderLeftColor = collab.color
    this.cursor.onmouseenter = this.resetDisplayNameTimeout.bind(this)
    this.cursor.appendChild(this.displayName)

    // Bookmark cursor widget
    this.cursorBookmark = document.createElement('span')
    this.cursorBookmark.className = 'collaborator-cursor-bookmark'
    this.cursorBookmark.appendChild(this.cursor)

    // Cursor during transition phase widget
    this.cursorTransition = document.createElement('span')
    this.cursorTransition.className = 'collaborator-cursor-transition mat-elevation-z2'
    this.cursorTransition.style.position = 'absolute'
    this.cursorTransition.style.borderLeftColor = this.color
    this.cursorTransition.style.display = 'none'
    this.cursorTransition.addEventListener('transitionend', (event: TransitionEvent) => {
      if (event.propertyName === 'transform' && this.bookmark) {
        if (this.nextPos) {
          this.translate(this.transitionPos, this.nextPos)
        } else {
          this.cursorTransition.style.display = 'none'
          this.setBookmarkCursorProperties()
          this.transitionPos = undefined
        }
      }
    })
    this.cm.getWrapperElement().appendChild(this.cursorTransition)
    if (!lineHeight) {
      const lineHeightPx = window.getComputedStyle(this.cm.getWrapperElement(), null).getPropertyValue('line-height')
      lineHeight = Number.parseInt(lineHeightPx.substr(0, lineHeightPx.length - 2), 10)
    }
  }

  resetDisplayNameTimeout() {
    if (this.displayName.style.width !== this.displayNameWidth) {
      this.displayName.style.width = this.displayNameWidth
      this.displayName.style.borderWidth = '0 thick 0 thick'
    }
    clearTimeout(this.displayNameTimeout)
    this.displayNameTimeout = setTimeout(() => {
      this.displayName.style.width = '0'
      this.displayName.style.borderWidth = '0'
    }, 1500)
  }

  updateDisplayName(displayName: string) {
    this.displayName.innerHTML = `&nbsp;${displayName}`
    this.displayNameWidth = `${15 + displayName.length * 5}px`
  }

  updateCursor(nextPos: CodeMirror.Position, animated = true) {
    if (this.bookmark) {
      if (this.transitionPos) {
        this.nextPos = nextPos
      } else {
        this.cursorBookmark.style.visibility = 'hidden'
        const from = this.bookmark.find()
        const props = this.calculateCursorProperties()
        if (props) {
          this.cursorHeight = props.height
          this.cursorMarginTop = props.marginTop
        }
        this.translate(from, nextPos, animated)
      }
      this.bookmark.clear()
      this.bookmark = this.cm.getDoc().setBookmark(nextPos, { widget: this.cursorBookmark, insertLeft: true }) as any
    } else {
      this.removeSelection()
      this.bookmark = this.cm.getDoc().setBookmark(nextPos, { widget: this.cursorBookmark, insertLeft: true }) as any
      this.setBookmarkCursorProperties()
      this.resetDisplayNameTimeout()
    }
  }

  removeCursor(): void {
    if (this.bookmark) {
      this.bookmark.clear()
      this.bookmark = undefined
      this.transitionPos = undefined
      this.nextPos = undefined
      this.cursorTransition.style.display = 'none'
      this.cursorBookmark.style.visibility = 'visible'
      this.removeSelection()
    }
  }

  updateSelection(anchor: CodeMirror.Position, head: CodeMirror.Position) {
    this.resetDisplayNameTimeout()
    if (this.selection) {
      this.selection.clear()
    }
    let from
    let to
    if (anchor.line < head.line) {
      ;[from, to] = [anchor, head]
    } else if (anchor.line === head.line) {
      if (anchor.ch < head.ch) {
        ;[from, to] = [anchor, head]
      } else {
        ;[from, to] = [head, anchor]
      }
    } else {
      ;[from, to] = [head, anchor]
    }
    this.selection = this.cm.getDoc().markText(from, to, { css: this.selectionCSS })
    if (this.bookmark) {
      this.bookmark.clear()
      this.bookmark = this.cm.getDoc().setBookmark(head, { widget: this.cursorBookmark, insertLeft: true }) as any
    } else {
      this.bookmark = this.cm.getDoc().setBookmark(head, { widget: this.cursorBookmark, insertLeft: true }) as any
      this.setBookmarkCursorProperties()
    }
    clearTimeout(this.displayNameTimeout)
    if (this.displayName.style.width !== this.displayNameWidth) {
      this.displayName.style.width = this.displayNameWidth
      this.displayName.style.borderWidth = '0 thick 0 thick'
    }
  }

  removeSelection() {
    if (this.selection) {
      this.selection.clear()
      this.selection = undefined
    }
  }

  clean() {
    this.removeCursor()
    this.cm.getWrapperElement().removeChild(this.cursorTransition)
  }

  private translate(from: CodeMirror.Position, to: CodeMirror.Position, animated = true) {
    this.transitionPos = to
    this.nextPos = undefined
    const { left, top } = this.cm.cursorCoords(from, 'local')
    if (this.displayName.style.width !== '0') {
      this.displayName.style.width = '0'
      this.displayName.style.borderWidth = '0'
    }
    const { top: scrollTop } = this.cm.getScrollInfo()
    const adjustedTop = top - scrollTop
    this.cursorTransition.style.transition = 'none'
    this.cursorTransition.style.transform = 'none'
    this.cursorTransition.style.height = this.cursorHeight
    this.cursorTransition.style.marginTop = this.cursorMarginTop
    this.cursorTransition.style.left = `${left}px`
    this.cursorTransition.style.top = `${adjustedTop + 6}px`
    this.cursorTransition.style.display = 'inline-block'
    const { left: newLeft, top: newTop } = this.cm.cursorCoords(to, 'local')
    const adjustedNewTop = newTop - scrollTop
    setTimeout(() => {
      if (animated) {
        this.cursorTransition.style.transition = 'transform 0.07s linear'
      } else {
        this.cursorTransition.style.transition = 'transform 0 linear'
      }

      this.cursorTransition.style.transform = `translate(${newLeft - left}px, ${adjustedNewTop - adjustedTop}px)`
    }, 0)
  }

  private calculateCursorProperties(): { height: string; marginTop: string } {
    let fontSize: string
    const previousSibling: any = this.cursorBookmark.parentElement.previousElementSibling
    if (previousSibling) {
      fontSize = window.getComputedStyle(previousSibling, null).getPropertyValue('font-size')
    } else if (
      this.cursorBookmark.parentElement &&
      this.cursorBookmark.parentElement.parentElement &&
      this.cursorBookmark.parentElement.parentElement.parentElement
    ) {
      const line = this.cursorBookmark.parentElement.parentElement.parentElement
      fontSize = window.getComputedStyle(line, null).getPropertyValue('font-size')
    } else {
      return
    }
    const fontSizeNumber = Number.parseInt(fontSize.substr(0, fontSize.length - 2), 10)
    const cursorHeight = fontSizeNumber + 5
    return {
      height: `${cursorHeight}px`,
      marginTop: `${(lineHeight - cursorHeight) / 2}px`,
    }
  }

  private setBookmarkCursorProperties() {
    const props = this.calculateCursorProperties()
    if (props) {
      if (this.cursor.style.height !== props.height) {
        this.cursor.style.height = props.height
      }
      if (this.cursor.style.marginTop !== props.marginTop) {
        this.cursor.style.marginTop = props.marginTop
      }
      if (this.cursorBookmark.style.visibility === 'hidden') {
        this.cursorBookmark.style.visibility = 'visible'
      }
    }
  }
}
