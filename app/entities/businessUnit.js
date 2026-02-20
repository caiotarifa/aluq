import { z } from 'zod'
import { companyDocumentMask } from '../registry/masks.js'

export default {
  name: 'businessUnit',

  hasMany: ['location'],

  aiDescription: 'A business unit represents a distinct part of a company, such as a department or division, that operates semi-independently.',

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
      type: 'text',
      searchable: true
    },

    legalName: {
      type: 'text',
      searchable: true
    },

    taxId: {
      type: 'text',
      icon: 'i-tabler-id',
      mask: companyDocumentMask(),
      searchable: true
    }
  },

  schema: z.object({
    id: z.string().optional(),
    isActive: z.boolean().optional().default(true),
    name: z.string().trim().min(1),
    legalName: z.string().trim().optional(),
    taxId: z.string().trim().optional()
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
    },

    inactive: {
      type: 'table',

      properties: [
        'name',
        'legalName',
        'taxId'
      ],

      ui: {
        pinned: { left: ['isActive', 'name'] }
      },

      query: {
        filter: [
          { property: 'isActive', operator: 'equals', value: false }
        ],

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
          { property: 'name', class: 'col-span-12 md:col-span-6' },
          { property: 'legalName', class: 'col-span-12 md:col-span-6' },
          { property: 'taxId', class: 'col-span-12 md:col-span-4' },
          { property: 'isActive', class: 'col-span-12 md:col-span-2' }
        ]
      }
    ]
  },

  actions: [{
    create: {
      icon: 'i-tabler-plus',
      to: '/app/business-units/new'
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
