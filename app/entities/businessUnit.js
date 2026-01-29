import * as v from 'valibot'

export default {
  name: 'businessUnit',

  display: {
    property: 'name',
    view: 'default'
  },

  properties: {
    id: {
      type: 'code'
    },

    isActive: {
      type: 'boolean'
    },

    name: {
      type: 'text'
    },

    legalName: {
      type: 'text'
    },

    taxId: {
      type: 'text'
    }
  },

  schema: v.object({
    id: v.optional(v.string()),

    isActive: v.optional(v.boolean(), true),
    name: v.string(),
    legalName: v.optional(v.string()),
    taxId: v.optional(v.string())
  }),

  views: {
    default: {
      type: 'table',

      properties: [
        'isActive',
        'name',
        'legalName',
        'taxId'
      ],

      ui: {
        pinned: { left: ['isActive', 'name'] }
      },

      query: {
        sort: [{ property: 'name', direction: 'asc' }]
      }
    }
  },

  actions: [{
    create: {
      icon: 'i-tabler-plus',
      to: '/app/business-units/new'
    }
  }]
}
