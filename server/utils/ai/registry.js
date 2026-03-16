import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parse } from 'yaml'

import * as entities from '~~/app/entities/index.js'

// Load i18n translations at startup.
const localePath = resolve('i18n/locales/pt-BR.yml')
const locale = parse(readFileSync(localePath, 'utf-8'))

// Build registry from entity files.
const entityRegistry = new Map()

function buildRelations(entity) {
  const relations = {}

  for (const name of entity.hasOne || []) {
    relations[name] = { type: 'hasOne', entity: name }
  }

  for (const name of entity.hasMany || []) {
    relations[name] = { type: 'hasMany', entity: name }
  }

  return relations
}

for (const key in entities) {
  const entity = entities[key]

  const translations = locale[entity.name] || {}

  const properties = {}
  const propertiesTranslations = translations.properties || {}

  for (const property in entity.properties) {
    properties[property] = {
      ...entity.properties[property],
      label: propertiesTranslations[property] || property
    }
  }

  entityRegistry.set(entity.name, {
    name: entity.name,
    label: translations.title || entity.name,
    aiDescription: entity.aiDescription || null,
    properties,
    relations: buildRelations(entity),
    propertyKeys: Object.keys(entity.properties)
  })
}

export { entityRegistry }

export function isAllowedEntity(name) {
  return entityRegistry.has(name.toLowerCase()) || entityRegistry.has(name)
}

export function resolveEntityName(name) {
  name = name.trim()

  if (entityRegistry.has(name)) {
    return name
  }

  const lower = name.toLowerCase()

  for (const key of entityRegistry.keys()) {
    if (key.toLowerCase() === lower) {
      return key
    }
  }

  return null
}

export function getEntityConfig(name) {
  const resolved = resolveEntityName(name)
  return resolved ? entityRegistry.get(resolved) : null
}

export function describeEntities() {
  const lines = ['# Entities']

  for (const [, entity] of entityRegistry) {
    lines.push('', `## ${entity.name} (${entity.label})`)

    if (entity.aiDescription) {
      lines.push('', entity.aiDescription)
    }

    // List properties.
    const properties = Object.entries(entity.properties) || []

    if (properties.length > 0) {
      lines.push('', '#### Properties')
    }

    for (const key in entity.properties) {
      const property = entity.properties[key]

      const parts = [
        `- ${key} (${property.label}): ${property.type}`
      ]

      if (property.options?.length) {
        const values = property.options
          .map(option => option.value ?? option)
          .join(', ')

        parts.push(`[${values}]`)
      }

      if (property.aiDescription) {
        parts.push(`— ${property.aiDescription}`)
      }

      lines.push(parts.join(' '))
    }

    // List relations.
    const relations = Object.entries(entity.relations) || []

    if (relations.length > 0) {
      lines.push('', '### Relations')
    }

    for (const key in entity.relations) {
      const relation = entity.relations[key]
      lines.push(`- ${key} (${relation.entity}): ${relation.type}`)
    }
  }

  return lines.join('\n')
}
