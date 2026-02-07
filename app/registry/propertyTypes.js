import {
  operatorGroups,
  isEmptyOperator,
  isArrayOperator
} from './operators.js'

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

    resolveInput: () => ({
      componentName: 'UInput',
      props: {}
    }),

    resolveFilterInput: ({ operator }) => {
      if (isEmptyOperator(operator)) return null

      return {
        componentName: 'InputFilterText',
        props: {}
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

    resolveFilterInput: (operator) => {
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

    resolveFilterInput: (operator) => {
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

    resolveFilterInput: (operator, property) => {
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

  relation: {
    operators: [...operatorGroups.relation],
    defaultOperator: 'some',

    defaultValue: {
      property: null,
      operator: null,
      value: null
    },

    resolveInput: property => ({
      component: 'InputRelation',
      props: {
        entity: property?.entity
      }
    }),

    resolveFilterInput: () => null
  }
}

export {
  propertyTypes
}
