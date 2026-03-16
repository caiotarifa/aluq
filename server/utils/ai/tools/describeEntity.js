import { tool } from 'ai'
import { z } from 'zod'

import { describeSingleEntity, isAllowedEntity } from '../registry'

export function createDescribeEntityTool() {
  return tool({
    description: [
      'Returns the full description of a specific entity: its properties, types, options, and relations.',
      'Call this tool before using the list tool whenever you need to know the available fields of an entity.',
      'Do not expose the raw output to the user — use it internally to build queries.'
    ].join('\n'),

    parameters: z.object({
      entityName: z.string().describe(
        'The name of the entity to describe (e.g. "businessUnit", "location").'
      )
    }),

    execute: async ({ entityName }) => {
      if (!isAllowedEntity(entityName)) {
        return {
          status: 'error',
          error: `Entity "${entityName}" not found. Use the list of available entities from the system prompt.`
        }
      }

      return {
        status: 'success',
        description: describeSingleEntity(entityName)
      }
    }
  })
}
