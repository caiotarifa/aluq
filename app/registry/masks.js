// Predefined masks.
const masks = {
  currency: '#.##0,00'
}

// Dynamic masks.
const companyDocumentMasks = {
  BR: '##.###.###/####-##', // CNPJ
  US: '##-#######', // EIN

  default: '##############'
}

function companyDocumentMask(country = 'BR') {
  return companyDocumentMasks[country] || companyDocumentMasks.default
}

const postalCodeMasks = {
  DE: '#####',
  AR: '@####@@@',
  BO: '####',
  BR: '#####-###',
  CA: '@#@ #@#',
  CL: '#######',
  ES: '#####',
  US: '#####',
  FR: '#####',
  GB: ['@# #@@', '@## #@@', '@#@ #@@', '@@# #@@', '@@## #@@', '@@#@ #@@'],
  IT: '#####',
  PY: '######',
  PT: '####-###',
  UY: '#####',

  default: undefined
}

function postalCodeMask(country = 'BR') {
  return postalCodeMasks[country] || postalCodeMasks.default
}

// Resolves mask reference to actual pattern.
function resolveMask(mask) {
  if (!mask) return undefined

  if (typeof mask === 'string' && masks[mask]) {
    return masks[mask]
  }

  return mask
}

export {
  masks,
  resolveMask,

  companyDocumentMask,
  postalCodeMask
}
