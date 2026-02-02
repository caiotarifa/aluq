import { tool, zodSchema } from 'ai'
import { z } from 'zod'

import {
  describeEntities,
  entityRegistry,
  getEntityConfig,
  resolveEntityName
} from '../registry'

// Constants.
const MAX_TAKE = 200
const DEFAULT_TAKE = 50

const LOGICAL_OPERATORS = new Set(['AND', 'OR', 'NOT'])

// Utils.
function nowIso() {
  return new Date().toISOString()
}

function pick(object, keys) {
  const result = {}

  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]

    if (object[key] !== undefined) {
      result[key] = object[key]
    }
  }

  return result
}

function errorResponse(code, message, hint) {
  return {
    status: 'error',
    error: { code, message, ...(hint ? { hint } : {}) }
  }
}

function hasAggregateRequest(input) {
  return Boolean(
    input._count || input._sum || input._avg || input._min || input._max
  )
}

// Descriptions.
function buildDescription() {
  return [
    'List records from an available entity in the database.',
    'Use this tool when the user asks for data, records, lists, counts, or aggregations.',
    '',
    '## Guardrails',
    '- You MUST use only entities listed below.',
    '- The "entity" must match an entity in the registry; unknown entities are rejected.',
    '',
    '## Features',
    '- where: filters (AND/OR/NOT + common operators like equals/in/gt/contains/etc).',
    '- orderBy: sorting (supports nested relations).',
    '- select: projection (supports nested relation selects).',
    '- skip/take: pagination.',
    '- _count/_sum/_avg/_min/_max: aggregates returned under meta.aggregate.',
    '- aggregates use the full where filter (ignore skip/take), so they may differ from data.',
    '',
    `Limits: take is 1..${MAX_TAKE}. Default take is ${DEFAULT_TAKE}.`,
    '',
    describeEntities()
  ].join('\n')
}

function buildAvailableEntitiesHint() {
  return `Available entities: ${[...entityRegistry.keys()].join(', ')}`
}

// Schemas.

// ~> orderBy (recursive).
// orderBy: { field: 'asc' | 'desc', relation: { ... } }
const sortOrderSchema = z.enum(['asc', 'desc'])
  .describe('Sort direction: asc or desc.')

// For recursive schemas, we define a base and extend it.
// This pattern is recommended by AI SDK for z.lazy() support.
const baseOrderBySchema = z.record(
  z.string(),
  sortOrderSchema
)

const orderBySchema = z.record(
  z.string(),
  z.union([sortOrderSchema, baseOrderBySchema])
).describe('Recursive orderBy (supports nesting via relations).')

// ~> select (recursive).
// select: { field: true, relation: { select: { ... } } }
const baseSelectSchema = z.record(z.string(), z.literal(true))

const selectSchema = z.record(
  z.string(),
  z.union([
    z.literal(true),
    z.object({ select: baseSelectSchema })
  ])
).describe('Recursive select: { field: true } or { relation: { select: { ... } } }.')

// ~> where
// where: { field: filter, AND: [...], OR: [...], NOT: {...} }
const scalarValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null()
])

const scalarFilterObjectSchema = z.object({
  equals: scalarValueSchema.optional(),
  not: scalarValueSchema.optional(),

  in: z.array(scalarValueSchema).optional(),
  notIn: z.array(scalarValueSchema).optional(),

  lt: scalarValueSchema.optional(),
  lte: scalarValueSchema.optional(),
  gt: scalarValueSchema.optional(),
  gte: scalarValueSchema.optional(),
  between: scalarValueSchema.optional(),

  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional()
})

const scalarFilterSchema = z.union([
  scalarValueSchema,
  scalarFilterObjectSchema
])

const listFilterSchema = z.object({
  has: scalarValueSchema.optional(),
  hasEvery: z.array(scalarValueSchema).optional(),
  hasSome: z.array(scalarValueSchema).optional(),
  isEmpty: z.boolean().optional()
})

const jsonFilterSchema = z.object({
  path: z.string().optional(),
  equals: z.unknown().optional(),
  not: z.unknown().optional(),

  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),

  mode: z.enum(['default', 'insensitive']).optional(),

  array_contains: z.unknown().optional(),
  array_starts_with: z.unknown().optional(),
  array_ends_with: z.unknown().optional()
})

const relationFilterSchema = z.object({
  some: z.record(z.string(), z.unknown()).optional(),
  every: z.record(z.string(), z.unknown()).optional(),
  none: z.record(z.string(), z.unknown()).optional()
})

// Where accepts field filters + logical operators (AND/OR/NOT).
const whereSchema = z.record(
  z.string(),

  z.union([
    scalarFilterSchema,
    listFilterSchema,
    jsonFilterSchema,
    relationFilterSchema,

    z.array(z.record(z.string(), z.unknown())), // AND/OR arrays
    z.record(z.string(), z.unknown()), // NOT or nested

    z.null()
  ])
).describe('Where filter (recursive). Supports AND/OR/NOT + field operators like equals/in/gt/contains/etc.')

// Aggregate.
const aggregateFieldsSchema = z.record(
  z.string(),
  z.literal(true)
).describe('Aggregation fields map: { field: true, ... }.')

const countAggregateSchema = z.union([
  z.literal(true),
  z.record(z.string(), z.literal(true))
]).describe('Count aggregation: true or { _all: true, field: true, ... }.')

const inputSchema = z.object({
  model: z.string()
    .min(1)
    .describe('Entity name from the registry (e.g. "businessUnit").'),

  where: whereSchema.optional(),
  orderBy: orderBySchema.optional(),
  select: selectSchema.optional(),

  take: z.number()
    .int()
    .min(1)
    .max(MAX_TAKE)
    .optional()
    .describe(`Max records to return (1..${MAX_TAKE}).`),

  skip: z.number()
    .int()
    .min(0)
    .optional()
    .describe('Records to skip (pagination).'),

  _count: countAggregateSchema.optional(),
  _sum: aggregateFieldsSchema.optional(),
  _avg: aggregateFieldsSchema.optional(),
  _min: aggregateFieldsSchema.optional(),
  _max: aggregateFieldsSchema.optional()
})

// Validate that all top-level keys in object are in allowedKeySet.
function validateKeys(label, object, allowedKeySet, options) {
  if (!object || typeof object !== 'object') {
    return { valid: true }
  }

  const ignore = options?.ignore || null
  const invalidKeys = []

  for (const key in object) {
    if (ignore && ignore.has(key)) continue

    if (!allowedKeySet.has(key)) {
      invalidKeys.push(key)
    }
  }

  if (invalidKeys.length === 0) {
    return { valid: true }
  }

  return {
    valid: false,
    error: `${label}: invalid keys: ${invalidKeys.join(', ')}.`,
    hint: `Allowed keys: ${[...allowedKeySet].join(', ')}`
  }
}

// Build allowed key set from entity config.
function buildAllowedKeySet(entity) {
  const allowedKeys = new Set()

  for (const key of entity.propertyKeys) {
    allowedKeys.add(key)
  }

  for (const relationName in entity.relations) {
    allowedKeys.add(relationName)
  }

  return allowedKeys
}

// Execute list tool.
async function executeList(db, input) {
  console.log('Executing list tool with input:', input)
  const startedAt = Date.now()
  const requestedAt = nowIso()

  // 1. Secure entity name.
  const modelInput = input.model
  const entityName = resolveEntityName(modelInput)

  if (!entityName) {
    return errorResponse(
      'MODEL_NOT_FOUND',
      `Entity "${modelInput}" was not found in the registry.`,
      buildAvailableEntitiesHint()
    )
  }

  // 2. Semantic validation (top-level only).
  const entity = getEntityConfig(entityName)
  const allowedKeySet = buildAllowedKeySet(entity)

  if (input.select) {
    const result = validateKeys('select', input.select, allowedKeySet)

    if (!result.valid) {
      return errorResponse('INVALID_SELECT', result.error, result.hint)
    }
  }

  if (input.where) {
    if (typeof input.where !== 'object' || input.where === null) {
      return errorResponse(
        'INVALID_WHERE',
        'where must be an object.',
        'Provide a where filter object.'
      )
    }

    if ('$expr' in input.where) {
      return errorResponse(
        'INVALID_WHERE',
        'where: $expr is not allowed.',
        'Remove $expr from where.'
      )
    }

    const result = validateKeys('where', input.where, allowedKeySet, {
      ignore: LOGICAL_OPERATORS
    })

    if (!result.valid) {
      return errorResponse('INVALID_WHERE', result.error, result.hint)
    }
  }

  if (input.orderBy) {
    const result = validateKeys('orderBy', input.orderBy, allowedKeySet)

    if (!result.valid) {
      return errorResponse('INVALID_ORDER_BY', result.error, result.hint)
    }
  }

  // Build findQuery.
  const take = Math.min(input.take || DEFAULT_TAKE, MAX_TAKE)
  const findQuery = { take }

  if (input.skip !== undefined) {
    findQuery.skip = input.skip
  }

  if (input.where) {
    findQuery.where = input.where
  }

  if (input.orderBy) {
    findQuery.orderBy = input.orderBy
  }

  if (input.select) {
    findQuery.select = input.select
  }

  // Build aggregate args (if requested).
  const wantsAggregate = hasAggregateRequest(input)
  const aggregateQuery = {}

  if (wantsAggregate) {
    if (input.where) {
      aggregateQuery.where = input.where
    }

    if (input._count !== undefined) {
      aggregateQuery._count = input._count
    }

    if (input._sum !== undefined) {
      aggregateQuery._sum = input._sum
    }

    if (input._avg !== undefined) {
      aggregateQuery._avg = input._avg
    }

    if (input._min !== undefined) {
      aggregateQuery._min = input._min
    }

    if (input._max !== undefined) {
      aggregateQuery._max = input._max
    }
  }

  // Execute in parallel (minimal branching, clear control flow).
  const modelClient = db[entityName]

  try {
    const dataPromise = modelClient.findMany(findQuery)

    const aggregatePromise = wantsAggregate
      ? modelClient.aggregate(aggregateQuery)
      : Promise.resolve(undefined)

    const [data, aggregate] = await Promise.all([
      dataPromise,
      aggregatePromise
    ])

    const meta = {
      model: entityName,
      label: entity.label,
      properties: buildProperties(entity, input.select),
      pagination: pick({ skip: input.skip, take }, ['skip', 'take']),
      timingMs: Date.now() - startedAt,
      requestedAt
    }

    if (aggregate !== undefined) {
      meta.aggregate = pick(aggregate, ['_count', '_sum', '_avg', '_min', '_max'])
    }

    return {
      status: 'success',
      meta,
      data
    }
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    return errorResponse(
      'QUERY_ERROR',
      message || 'Failed to execute query.',
      'Review where/orderBy/select/pagination and try again.'
    )
  }
}

// Build properties map based on select input.
function buildProperties(entity, select) {
  const properties = {}

  if (select && typeof select === 'object') {
    for (const key in select) {
      if (select[key] === true && entity.properties[key]) {
        properties[key] = entity.properties[key].label
      }
    }

    return properties
  }

  for (const key in entity.properties) {
    properties[key] = entity.properties[key].label
  }

  return properties
}

// Tool factory.
export function createListTool(authDb, session) {
  const db = authDb.$setAuth({
    userId: session.userId,
    organizationId: session.activeOrganizationId
  })

  return tool({
    description: buildDescription(),
    inputSchema: zodSchema(inputSchema),
    execute: input => executeList(db, input)
  })
}
