const endings = {
  ves: 'fe',
  ies: 'y',
  i: 'us',
  zes: 'ze',
  ses: 's',
  es: 'e',
  s: ''
}

const endingsKeys = Object.keys(endings).join('|')

export default function singularize(input) {
  return input.replace(
    new RegExp(`(${endingsKeys})$`),
    r => endings[r]
  )
}
