import * as CodeMirror from 'codemirror'

export class CollaboratorCursor {

  private cm: CodeMirror.Editor
  private isHidden = true
  private previousPos

  // DOM html element for cursor visualisation
  private domElm: HTMLElement

  // CodeMirror TextMakrer bookmark object. Cursor indicator on Code
  private bookmark: any


  constructor (cm: CodeMirror.Editor, color: string) {
    this.cm = cm
    this.domElm = document.createElement('span')
    this.domElm.className = 'collaborator-cursor'
    this.domElm.style.borderLeftColor = color
    this.domElm.style.display = 'none'
    this.cm.getWrapperElement().appendChild(this.domElm)
  }

  translate (pos: CodeMirror.Position) {
    this.previousPos = pos
    const newCoords = this.cm.cursorCoords(pos, 'local')
    if (this.bookmark !== undefined) {
      this.bookmark.clear()
    }
    this.bookmark = this.cm.getDoc().setBookmark(pos, {insertLeft: true})
    this.domElm.style.transform = `translate(${newCoords.left}px, ${newCoords.top}px)`
  }

  updateCursor () {
    if (this.bookmark !== undefined && this.previousPos !== this.bookmark.find()) {
      const newCoords = this.cm.cursorCoords(this.bookmark.find(), 'local')
      this.domElm.style.transform = `translate(${newCoords.left}px, ${newCoords.top}px)`
    }
  }

  hide (): void {
    if (!this.isHidden) {
      this.domElm.style.display = 'none'
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
    }
    this.cm.getWrapperElement().removeChild(this.domElm)
  }

  isPosChanged () {
    return this.bookmark !== undefined && this.previousPos !== this.bookmark.find()
  }
}

