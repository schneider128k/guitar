// Rotating epigraph — a different guitarist's words on each page load.
// Attributions are as the quotes are popularly cited.
export const QUOTES = [
  { text: 'The guitar is a small orchestra. Every string is a different color, a different voice.', who: 'Andrés Segovia' },
  { text: "Music doesn't lie. If there is something to be changed in this world, it can only happen through music.", who: 'Jimi Hendrix' },
  { text: 'The beautiful thing about learning is that nobody can take it away from you.', who: 'B.B. King' },
  { text: 'I may not be able to read music, but I can read an audience.', who: 'Jimmy Page' },
  { text: 'If I copied somebody, I tried to do it differently, or better.', who: 'Eddie Van Halen' },
  { text: 'Tone is in your fingers.', who: 'Stevie Ray Vaughan' },
  { text: 'Do it again on the next verse, and people think you meant it.', who: 'Chet Atkins' },
  { text: 'Without music to decorate it, time is just a bunch of boring production deadlines.', who: 'Frank Zappa' },
  { text: "Music is a language. It speaks in emotions, and if it's in the bones, it's in the bones.", who: 'Keith Richards' },
  { text: 'When you strum a guitar you have everything — rhythm, bass, lead, and melody.', who: 'David Gilmour' },
  { text: 'Knowledge speaks, but wisdom listens.', who: 'Jimi Hendrix' },
  { text: 'You can have all the right equipment, but if you don’t have the touch, it won’t matter.', who: 'Stevie Ray Vaughan' },
  { text: 'The more you practice, the luckier you get.', who: 'Joe Pass' },
  { text: 'Anybody can play. The note is only twenty percent. The attitude of the motherfucker who plays it is eighty.', who: 'Miles Davis' },
  { text: 'Learn everything, then forget it all, and just play.', who: 'Charlie Parker' },
];

export function randomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
