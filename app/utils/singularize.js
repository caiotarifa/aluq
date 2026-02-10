const endings = {
  ves: 'fe',
  ies: 'y',
  i: 'us',
  zes: 'ze',
  ses: 's',
  es: 'e',
  s: ''
}

const pattern = new RegExp(`(${Object.keys(endings).join('|')})$`)

export default function singularize(input) {
  return input.replace(pattern, r => endings[r])
}
