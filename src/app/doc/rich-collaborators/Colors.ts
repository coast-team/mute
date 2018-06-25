const COLORS = [
  '#a4c400',
  '#60a917',
  '#008a00',
  '#00aba9',
  '#1ba1e2',
  '#0050ef',
  '#6a00ff',
  '#aa00ff',
  '#f472d0',
  '#d80073',
  '#a20025',
  '#e51400',
  '#fa6800',
  '#f0a30a',
  '#e3c800',
  '#825a2c',
  '#6d8764',
  '#647687',
  '#76608a',
  '#a0522d',
]

export class Colors {
  private available: string[]

  constructor() {
    this.available = COLORS.slice()
  }

  pick(): string {
    let color: string
    if (this.available.length !== 0) {
      const index = Math.floor(Math.random() * this.available.length)
      color = this.available[index]
      this.available.splice(index, 1)
    } else {
      color = COLORS[Math.floor(Math.random() * COLORS.length)]
    }
    return color
  }

  dismiss(color: string) {
    this.available.push(color)
  }
}
