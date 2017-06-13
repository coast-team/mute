import * as CodeMirror from 'codemirror'

export class CollaboratorCursor {

  private selectionCSS: string

  private cm: CodeMirror.Editor
  private isHidden = true
  private previousPos
  private selection: CodeMirror.TextMarker

  // DOM html element for cursor visualisation
  private domElm: HTMLElement

  // CodeMirror TextMakrer bookmark object. Cursor indicator on Code
  private bookmark: any


  constructor (cm: CodeMirror.Editor, color: string) {
    this.cm = cm
    this.selectionCSS = `background-color: ${color};`
    this.domElm = document.createElement('span')
    this.domElm.className = 'collaborator-cursor'
    this.domElm.style.borderLeftColor = color
    this.domElm.style.display = 'none'
    this.cm.getWrapperElement().appendChild(this.domElm)
  }

  translate (pos: CodeMirror.Position, isAnimated = true) {
    this.previousPos = pos
    const newCoords = this.cm.cursorCoords(pos, 'local')
    if (this.bookmark !== undefined) {
      this.bookmark.clear()
    }
    this.bookmark = this.cm.getDoc().setBookmark(pos, {insertLeft: true})
    if (isAnimated) {
      this.domElm.style.transitionDuration = '.12s'
    } else {
      this.domElm.style.transitionDuration = '0s'
    }
    this.domElm.style.transform = `translate(${newCoords.left}px, ${newCoords.top}px)`
  }

  update (linesNb: number, firstLineLength: number) {
    if (this.bookmark !== undefined && this.previousPos !== this.bookmark.find()) {
      const newCoords = this.cm.cursorCoords(this.bookmark.find(), 'local')
      if (linesNb === 1 && firstLineLength < 6) {
        this.domElm.style.transitionDuration = '.02s'
      }
      this.domElm.style.transform = `translate(${newCoords.left}px, ${newCoords.top}px)`
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

  hide (): void {
    if (!this.isHidden) {
      this.domElm.style.display = 'none'
      this.clearSelection()
      this.isHidden = true
    }
  }

  show (): void {
    if (this.isHidden) {
      this.domElm.style.display = 'inline-block'
      this.isHidden = false
    }
  }

  clear () {
    if (this.bookmark !== undefined) {
      this.bookmark.clear()
      this.bookmark = undefined
    }
    this.clearSelection()
    this.cm.getWrapperElement().removeChild(this.domElm)
  }

  clearSelection () {
    if (this.selection !== undefined) {
      this.selection.clear()
      this.selection = undefined
    }
  }

  isPosChanged () {
    return this.bookmark !== undefined && this.previousPos !== this.bookmark.find()
  }
}

