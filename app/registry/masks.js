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

  companyDocumentMask
}
