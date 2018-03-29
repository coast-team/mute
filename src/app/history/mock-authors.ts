export const AUTHORS: Array<[number, string]> = [
  [randId(), 'Mr Smith'],
  [randId(), 'Dostoevsky'],
  [randId(), 'Neil Armstrong'],
  [randId(), 'Yuri Gagarin'],
  [randId(), 'Alan Turing'],
  [randId(), 'J.D.'],
  [randId(), 'Geralt of Rivia'],
]

function randId() {
  return Math.ceil(Math.random() * 10000)
}
