import {
  operatorGroups,
  isEmptyOperator,
  isArrayOperator
} from './operators.js'

import { resolveMask } from './masks.js'

const propertyTypes = {
  boolean: {
    icon: 'i-tabler-toggle-left',

    operators: [
      ...operatorGroups.equality
    ],

    defaultOperator: 'equals',
    defaultValue: false,

    resolveInput: () => ({
      component: 'InputBoolean',
      props: {}
    }),

    resolveFilterInput: () => ({
      component: 'InputFilterBoolean',
      props: {}
    }),

    resolveDisplay: () => ({
      component: 'DisplayBoolean',
      props: {}
    })
  },

  code: {
    icon: 'i-tabler-hash',
    extends: 'text',

    operators: [
      ...operatorGroups.equality,
      ...operatorGroups.array,
      ...operatorGroups.empty
    ],

    defaultOperator: 'equals',

    resolveInput: () => ({
      component: 'InputCode',
      props: {}
    }),

    resolveDisplay: () => ({
      component: 'DisplayCode',
      props: {}
    })
  },

  currency: {
    icon: 'i-tabler-coins',
    extends: 'number',

    resolveInput: () => ({
      component: 'InputCurrency',
      props: {}
    }),

    resolveDisplay: () => ({
      component: 'DisplayCurrency',
      props: {}
    })
  },

  date: {
    icon: 'i-tabler-calendar',

    operators: [
      ...operatorGroups.equality,
      ...operatorGroups.comparison,
      ...operatorGroups.range,
      ...operatorGroups.empty
    ],

    defaultOperator: 'equals',
    defaultValue: null,

    resolveInput: () => ({
      component: 'InputDate',
      props: {}
    }),

    resolveFilterInput: (property, { operator }) => {
      if (isEmptyOperator(operator)) return null

      return {
        component: 'InputDate',
        props: { range: operator === 'between' }
      }
    },

    resolveDisplay: () => ({
      component: 'DisplayDate',
      props: {}
    })
  },

  datetime: {
    icon: 'i-tabler-calendar-clock',
    extends: 'date',

    resolveInput: () => ({
      component: 'InputDateTime',
      props: {}
    })
  },

  email: {
    icon: 'i-tabler-mail',
    extends: 'text',

    resolveDisplay: () => ({
      component: 'DisplayEmail',
      props: {}
    })
  },

  number: {
    icon: 'i-tabler-numbers',

    operators: [
      ...operatorGroups.equality,
      ...operatorGroups.comparison,
      ...operatorGroups.range,
      ...operatorGroups.array,
      ...operatorGroups.empty
    ],

    defaultOperator: 'equals',
    defaultValue: null,

    resolveInput: () => ({
      component: 'UInputNumber',
      props: {}
    }),

    resolveFilterInput: (property, { operator }) => {
      if (isEmptyOperator(operator)) return null

      if (isArrayOperator(operator)) {
        return {
          component: 'InputFilterList',
          props: { type: 'number' }
        }
      }

      return {
        component: 'InputFilterNumber',
        props: { between: operator === 'between' }
      }
    },

    resolveDisplay: () => ({
      component: 'DisplayNumber',
      props: {}
    })
  },

  phone: {
    icon: 'i-tabler-phone',

    operators: [
      ...operatorGroups.equality,
      ...operatorGroups.text,
      ...operatorGroups.array,
      ...operatorGroups.empty
    ],

    defaultOperator: 'contains',
    defaultValue: '',

    resolveInput: () => ({
      component: 'InputPhone',
      props: {}
    }),

    resolveFilterInput: (property, { operator }) => {
      if (isEmptyOperator(operator)) return null

      return {
        component: 'InputText',
        props: {}
      }
    },

    resolveDisplay: () => ({
      component: 'DisplayPhone',
      props: {}
    })
  },

  relation: {
    icon: 'i-tabler-circles-relation',

    operators: [
      ...operatorGroups.equality,
      ...operatorGroups.empty
    ],

    defaultOperator: 'equals',
    defaultValue: null,

    resolveInput: property => ({
      component: 'InputRelation',
      props: { entity: property?.entity }
    }),

    resolveFilterInput: (property, { operator }) => {
      if (isEmptyOperator(operator)) return null

      return {
        component: 'InputRelation',
        props: { entity: property?.entity }
      }
    },

    resolveDisplay: property => ({
      component: 'DisplayRelation',
      props: { entity: property?.entity }
    })
  },

  select: {
    icon: 'i-tabler-list',

    operators: [
      ...operatorGroups.equality,
      ...operatorGroups.array,
      ...operatorGroups.empty
    ],

    defaultOperator: 'equals',
    defaultValue: null,

    resolveInput: property => ({
      component: 'USelect',
      props: { items: property?.options || [] }
    }),

    resolveFilterInput: (property, { operator }) => {
      if (isEmptyOperator(operator)) return null

      return {
        component: 'InputFilterSelect',
        props: {
          items: property?.items || [],
          multiple: isArrayOperator(operator)
        }
      }
    },

    resolveDisplay: property => ({
      component: 'DisplaySelect',
      props: { items: property?.items || [] }
    })
  },

  text: {
    icon: 'i-tabler-abc',

    operators: [
      ...operatorGroups.equality,
      ...operatorGroups.text,
      ...operatorGroups.array,
      ...operatorGroups.empty
    ],

    defaultOperator: 'contains',
    defaultValue: '',

    resolveInput: property => ({
      component: 'InputText',
      props: { mask: resolveMask(property.mask) }
    }),

    resolveFilterInput: (property, { operator }) => {
      if (isEmptyOperator(operator)) return null

      return {
        component: 'InputText',
        props: { mask: resolveMask(property.mask) }
      }
    },

    resolveDisplay: property => ({
      component: 'DisplayText',
      props: { mask: resolveMask(property.mask) }
    })
  },

  textarea: {
    icon: 'i-tabler-align-left',
    extends: 'text',

    resolveInput: () => ({
      component: 'UTextarea',
      props: {}
    })
  },

  time: {
    icon: 'i-tabler-clock',

    operators: [
      ...operatorGroups.equality,
      ...operatorGroups.comparison,
      ...operatorGroups.range,
      ...operatorGroups.empty
    ],

    defaultOperator: 'equals',
    defaultValue: null,

    resolveInput: () => ({
      component: 'InputTime',
      props: {}
    }),

    resolveFilterInput: (property, { operator }) => {
      if (isEmptyOperator(operator)) return null

      return {
        component: 'InputTime',
        props: { size: 'sm', variant: 'soft' }
      }
    },

    resolveDisplay: () => ({
      component: 'DisplayText',
      props: {}
    })
  },

  url: {
    icon: 'i-tabler-link',
    extends: 'text'
  }
}

// Resolution with inheritance and cache.
const resolvedCache = {}

function resolvePropertyType(typeName) {
  if (resolvedCache[typeName]) {
    return resolvedCache[typeName]
  }

  const definition = propertyTypes[typeName]

  if (!definition) {
    return resolvePropertyType('text')
  }

  if (!definition.extends) {
    resolvedCache[typeName] = definition
    return definition
  }

  const resolved = {
    ...resolvePropertyType(definition.extends),
    ...definition
  }

  delete resolved.extends

  resolvedCache[typeName] = resolved
  return resolved
}

export {
  propertyTypes,
  resolvePropertyType
}
