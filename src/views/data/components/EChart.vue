<template>
  <div ref="elRef" class="echart" :style="{ height }"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'

const props = withDefaults(
  defineProps<{
    option: EChartsOption
    height?: string
  }>(),
  {
    height: '320px',
  }
)

const elRef = ref<HTMLDivElement | null>(null)
let chart: ECharts | null = null
let ro: ResizeObserver | null = null

const render = () => {
  if (!elRef.value) return
  if (!chart) chart = echarts.init(elRef.value)
  chart.setOption(props.option, { notMerge: true, lazyUpdate: true })
}

onMounted(() => {
  render()
  ro = new ResizeObserver(() => {
    chart?.resize()
  })
  if (elRef.value) ro.observe(elRef.value)
})

watch(
  () => props.option,
  () => {
    render()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.echart {
  width: 100%;
}
</style>
