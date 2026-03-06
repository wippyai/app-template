<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'
import { useComponentProps, DEFAULT_LABELS, DEFAULT_VALUES, DEFAULT_TITLE } from '../constants'

Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

const props = useComponentProps()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart<'doughnut'> | null = null

const labels = computed(() => props.value.labels ?? DEFAULT_LABELS)
const values = computed(() => props.value.values ?? DEFAULT_VALUES)
const title = computed(() => props.value.title ?? DEFAULT_TITLE)

const COLORS = [
  '#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7',
  '#f97316', '#06b6d4', '#ec4899', '#84cc16', '#6366f1',
]

function createChart() {
  if (!canvasRef.value) return

  chartInstance = new Chart(canvasRef.value, {
    type: 'doughnut',
    data: {
      labels: labels.value,
      datasets: [{
        data: values.value,
        backgroundColor: COLORS.slice(0, values.value.length),
        borderWidth: 2,
        borderColor: 'transparent',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 10,
          },
        },
        tooltip: {
          enabled: true,
        },
      },
    },
  })
}

function updateChart() {
  if (!chartInstance) return
  chartInstance.data.labels = labels.value
  chartInstance.data.datasets[0].data = values.value
  chartInstance.data.datasets[0].backgroundColor = COLORS.slice(0, values.value.length)
  chartInstance.update()
}

watch([labels, values], () => {
  if (chartInstance) {
    updateChart()
  }
})

onMounted(() => {
  createChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<template>
  <div class="chart-container">
    <h2
      id="chart-heading"
      class="chart-title"
    >
      {{ title }}
    </h2>
    <div class="chart-canvas-wrapper">
      <canvas
        ref="canvasRef"
        role="img"
        :aria-label="`${title}: ${labels.map((l, i) => `${l} ${values[i]}`).join(', ')}`"
      >
        {{ labels.map((l, i) => `${l}: ${values[i]}`).join(', ') }}
      </canvas>
    </div>
  </div>
</template>
