<template>
  <component :is="tag">
    <TransitionGroup :name="transition">
      <div
        v-for="(data, index) in internalList"
        :key="getItemKey(data)"
        v-bind="item"
        @dragover.prevent
        @dragenter.prevent="onDragEnter(index)"
      >
        <slot
          :drag="getDragAttrs(index)"
          :index
          :item="data"
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

  transition: {
    type: String,
    default: 'drag-list'
  },

  throttle: {
    type: Number,
    default: 150
  }
})

const emit = defineEmits(['reorder'])

// Model.
const model = defineModel({
  type: Array,
  default: () => []
})

// Internal list for visual reordering during drag.
const internalList = ref([])
const isDragging = ref(false)

watch(model, (newValue) => {
  if (!isDragging.value) {
    internalList.value = [...newValue]
  }
}, { immediate: true })

// Keys.
const keyCounter = ref(0)
const itemKeys = new Map()

function getItemKey(item) {
  if (!itemKeys.has(item)) {
    itemKeys.set(item, keyCounter.value++)
  }

  return itemKeys.get(item)
}

// Drag and Drop.
const draggedIndex = ref(null)
const lastSwapTime = ref(0)

function onDragStart(index) {
  isDragging.value = true
  draggedIndex.value = index
  lastSwapTime.value = 0
}

function onDragEnter(index) {
  if (draggedIndex.value === null || draggedIndex.value === index) return

  const now = Date.now()
  if (now - lastSwapTime.value < props.throttle) return
  lastSwapTime.value = now

  const newItems = [...internalList.value]
  const [draggedItem] = newItems.splice(draggedIndex.value, 1)
  newItems.splice(index, 0, draggedItem)

  internalList.value = newItems
  draggedIndex.value = index
}

function onDragEnd() {
  if (isDragging.value) {
    model.value = [...internalList.value]
    emit('reorder', internalList.value)
  }

  isDragging.value = false
  draggedIndex.value = null
  lastSwapTime.value = 0
}

function getDragAttrs(index) {
  return {
    draggable: true,
    onDragstart: () => onDragStart(index),
    onDragend: () => onDragEnd()
  }
}
</script>

<style>
.drag-list-move {
  transition: transform 0.2s ease;
}

.drag-list-enter-active,
.drag-list-leave-active {
  transition: all 0.2s ease;
}

.drag-list-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.drag-list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.drag-list-leave-active {
  position: absolute;
}
</style>
