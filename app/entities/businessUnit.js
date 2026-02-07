import { z } from 'zod'

export default {
  name: 'businessUnit',

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
      type: 'text'
    },

    legalName: {
      type: 'text'
    },

    taxId: {
      type: 'text',
      icon: 'i-tabler-id'
    }
  },

  schema: z.object({
    id: z.string().optional(),
    isActive: z.boolean().optional().default(true),
    name: z.string(),
    legalName: z.string().optional(),
    taxId: z.string().optional()
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
