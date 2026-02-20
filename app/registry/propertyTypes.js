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
    }
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
    })
  },

  number: {
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
      component: 'InputNumber',
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
    }
  },

  date: {
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
        component: 'InputFilterDate',
        props: { range: operator === 'between' }
      }
    }
  },

  select: {
    operators: [
      ...operatorGroups.equality,
      ...operatorGroups.array,
      ...operatorGroups.empty
    ],

    defaultOperator: 'equals',
    defaultValue: null,

    resolveInput: property => ({
      component: 'InputSelect',
      props: {
        options: property?.options || []
      }
    }),

    resolveFilterInput: (property, { operator }) => {
      if (isEmptyOperator(operator)) return null

      return {
        component: 'InputFilterSelect',
        props: {
          options: property?.options || [],
          multiple: isArrayOperator(operator)
        }
      }
    }
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
        component: 'InputFilterText',
        props: {}
      }
    }
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
    }
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
