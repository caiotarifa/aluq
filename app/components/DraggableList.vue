<template>
  <component :is="tag">
    <TransitionGroup :name="transition">
      <div
        v-for="(entry, index) in localItems"
        :key="entry.id"
        :class="{ 'opacity-50': draggedIndex === index }"
        v-bind="item"
        @pointerenter="onDragOver(index)"
      >
        <slot
          :item="entry.data"
          :index
          :drag="getHandleAttrs(index)"
        />
      </div>
    </TransitionGroup>
  </component>
</template>

<script setup>
const props = defineProps({
  tag: {
    type: String,
    default: 'div'
  },

  item: {
    type: Object,
    default: () => ({})
  },

  itemKey: {
    type: String,
    default: null
  },

  transition: {
    type: String,
    default: 'drag-list'
  },

  throttle: {
    type: Number,
    default: 50
  }
})

const emit = defineEmits([
  'reorder'
])

const model = defineModel({
  type: Array,
  default: () => []
})

// Need stable IDs for items.
const itemIds = new WeakMap()
const id = { next: 0 }

function toItems(value) {
  return value.map((data) => {
    if (props.itemKey) {
      return { id: data[props.itemKey], data }
    }

    if (!itemIds.has(data)) {
      itemIds.set(data, id.next++)
    }

    return { id: itemIds.get(data), data }
  })
}

function toModel(items) {
  return items.map(item => item.data)
}

// Items.
const localItems = ref(toItems(model.value))

watch(model, (value) => {
  if (draggedIndex.value !== null) return

  const currentData = toModel(localItems.value)
  const isSameData = JSON.stringify(currentData) === JSON.stringify(value)

  if (isSameData) return

  localItems.value = toItems(value)
})

// Drag.
const draggedIndex = ref(null)
const dragState = { lastTime: 0 }

function onDragStart(index, event) {
  event.preventDefault()

  localItems.value = toItems(model.value)
  draggedIndex.value = index
  dragState.lastTime = 0

  document.addEventListener('pointerup', onDragEnd)
}

function onDragOver(index) {
  if ([null, index].includes(draggedIndex.value)) return

  const now = Date.now()

  if (now - dragState.lastTime < props.throttle) return

  dragState.lastTime = now

  const list = [...localItems.value]
  const [moved] = list.splice(draggedIndex.value, 1)

  list.splice(index, 0, moved)
  localItems.value = list
  draggedIndex.value = index
}

function onDragEnd() {
  document.removeEventListener('pointerup', onDragEnd)

  if (draggedIndex.value === null) return

  model.value = toModel(localItems.value)
  draggedIndex.value = null

  emit('reorder', model.value)
}

function getHandleAttrs(index) {
  return {
    class: 'cursor-grab active:cursor-grabbing touch-none select-none',
    onPointerdown: event => onDragStart(index, event)
  }
}

onUnmounted(() => {
  document.removeEventListener('pointerup', onDragEnd)
})
</script>

<style>
.drag-list-move {
  transition: transform 150ms ease-out;
}
</style>
