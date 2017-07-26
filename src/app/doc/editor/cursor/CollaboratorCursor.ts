import * as CodeMirror from 'codemirror'

import { RichCollaborator } from '../../rich-collaborators/'

const DEFAULT_BOOKMARK_POSITION = {line: 0, ch: 0}

export class CollaboratorCursor {

  private selectionCSS: string

  private cm: CodeMirror.Editor
  private isHidden = true
  private previousBookmarkPos
  private selection: CodeMirror.TextMarker
  private pseudoElmWidth: string
  private pseudoTimeout: any

  // DOM html element for cursor and pseudo visualisation
  private cursorElm: HTMLElement
  private pseudoElm: HTMLElement

  // CodeMirror TextMakrer bookmark object. Cursor indicator for Codemirror
  private bookmark: any


  constructor (cm: CodeMirror.Editor, collab: RichCollaborator) {
    this.cm = cm
    this.selectionCSS = `opacity: .7; background-color: ${collab.color};`

    // Initialize bookmark
    this.previousBookmarkPos = DEFAULT_BOOKMARK_POSITION
    this.bookmark = this.cm.getDoc()
      .setBookmark(DEFAULT_BOOKMARK_POSITION, {insertLeft: true})

    // HTML element for cursor
    this.cursorElm = document.createElement('span')
    this.cursorElm.className = 'collaborator-cursor'
    this.cursorElm.style.borderLeftColor = collab.color
    this.cursorElm.style.display = 'none'
    this.cursorElm.onmouseenter = this.resetPseudoTimeout.bind(this)

    // HTML element for pseudo
    this.pseudoElm = document.createElement('span')
    this.pseudoElm.className = 'collaborator-pseudo'
    this.pseudoElm.style.backgroundColor = collab.color
    this.pseudoElm.style.width = '0'
    this.updatePseudo(collab.pseudo)

    // Append elements to DOM
    this.cursorElm.appendChild(this.pseudoElm)
    this.cm.getWrapperElement().appendChild(this.cursorElm)
  }

  resetPseudoTimeout () {
    this.pseudoElm.style.width = this.pseudoElmWidth
    clearTimeout(this.pseudoTimeout)
    this.pseudoTimeout = setTimeout(() => {
      this.pseudoElm.style.width = '0'
    }, 1500)
  }

  updatePseudo (pseudo: string) {
    this.pseudoElm.innerHTML = `&nbsp;${pseudo}`
    this.pseudoElmWidth = `${15 + pseudo.length * 5}px`
  }

  translateCursorOnRemoteChange (pos: CodeMirror.Position, isAnimated = true) {
    this.previousBookmarkPos = pos
    const newCoords = this.cm.cursorCoords(pos, 'local')
    this.bookmark.clear()
    this.bookmark = this.cm.getDoc().setBookmark(pos, {insertLeft: true})
    if (isAnimated) {
      this.cursorElm.style.transitionDuration = '.12s'
    } else {
      this.cursorElm.style.transitionDuration = '0.03s'
    }
    this.showCursor()
    this.cursorElm.style.transform = `translate(${newCoords.left}px, ${newCoords.top}px)`
    this.resetPseudoTimeout()
  }

  translateCursorOnLocalChange (linesNb: number, firstLineLength: number) {
    let currentBookmarkPos = this.bookmark.find()
    if (currentBookmarkPos === undefined) {
      this.bookmark = this.cm.getDoc()
        .setBookmark(DEFAULT_BOOKMARK_POSITION, {insertLeft: true})
      currentBookmarkPos = this.bookmark.find()
    }
    if (this.previousBookmarkPos.line !== currentBookmarkPos.line ||
        this.previousBookmarkPos.ch !== currentBookmarkPos.ch) {
      const newCoords = this.cm.cursorCoords(currentBookmarkPos, 'local')
      if (linesNb === 1 && firstLineLength < 6) {
        this.cursorElm.style.transitionDuration = '0.03s'
      }
      this.cursorElm.style.transform = `translate(${newCoords.left}px, ${newCoords.top}px)`
      this.resetPseudoTimeout()
    }
  }

  updateSelection (from: CodeMirror.Position, to: CodeMirror.Position) {
    if (this.selection !== undefined) {
      this.selection.clear()
    }
    this.selection = this.cm.getDoc().markText(from, to, {
      css: this.selectionCSS
    })
  }

  hideCursor (): void {
    if (!this.isHidden) {
      this.cursorElm.style.display = 'none'
      this.clearSelection()
      this.isHidden = true
    }
  }

  showCursor (): void {
    if (this.isHidden) {
      this.cursorElm.style.display = 'inline-block'
      this.isHidden = false
    }
  }

  clearAll () {
    if (this.bookmark !== undefined) {
      this.bookmark.clear()
      this.bookmark = undefined
    }
    this.clearSelection()
    this.cm.getWrapperElement().removeChild(this.cursorElm)
  }

  clearSelection () {
    if (this.selection !== undefined) {
      this.selection.clear()
      this.selection = undefined
    }
  }

  private isPosChanged () {
    return this.bookmark !== undefined && this.previousBookmarkPos !== this.bookmark.find()
  }
}

