import { z } from 'zod'

export default {
  name: 'location',

  hasOne: ['businessUnit'],

  display: {
    property: 'name',
    view: 'default'
  },

  properties: {
    id: {
      type: 'code'
    },

    name: {
      type: 'text',
      searchable: true
    },

    businessUnitId: {
      type: 'relation',
      entity: 'businessUnit'
    }
  },

  schema: z.object({
    id: z.string().optional(),
    name: z.string().trim().min(1),
    businessUnitId: z.string().min(1)
  }),

  views: {
    default: {
      type: 'table',

      properties: [
        'name',
        'businessUnit.name',
        'businessUnit.taxId'
      ],

      ui: {
        pinned: { left: ['name'] }
      },

      query: {
        sort: [{ property: 'name', direction: 'asc' }]
      }
    }
  },

  form: {
    fieldsets: [
      {
        name: 'general',
        class: 'grid grid-cols-12 gap-4',
        fields: [
          {
            property: 'name',
            class: 'col-span-12 md:col-span-6'
          },
          {
            property: 'businessUnitId',
            class: 'col-span-12 md:col-span-6'
          }
        ]
      }
    ]
  },

  actions: [{
    create: {
      icon: 'i-tabler-plus',
      to: '/app/locations/new'
    }
  }],

  itemActions: {
    edit: {
      icon: 'i-tabler-edit'
    },

    delete: {
      icon: 'i-tabler-trash',
      execute: 'delete',
      color: 'error'
    }
  },

  batchActions: {
    delete: {
      icon: 'i-tabler-trash',
      execute: 'delete',
      color: 'error'
    }
  }
}
