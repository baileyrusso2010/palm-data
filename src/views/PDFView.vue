<template>
  <input type="file" ref="pdfInput" accept="application/pdf" @change="loadPdf" />
  <div class="pdf-container">
    <canvas ref="canvasEl"></canvas>
    <div class="square draggable"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import interact from 'interactjs'

// Set worker source to the imported URL
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl

const canvasEl = ref(null)

// Define the drag move listener function
function dragMoveListener(event) {
  const target = event.target
  // Keep the dragged position in the data-x/data-y attributes
  const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
  const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

  // Translate the element
  target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

  // Update the position attributes
  target.setAttribute('data-x', x)
  target.setAttribute('data-y', y)
}

async function loadPdf(event) {
  console.log('loadPdf called', event.target.files[0])
  const file = event.target.files[0]
  if (!file) return
  const arrayBuffer = await file.arrayBuffer()
  console.log('File read as arrayBuffer')
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
  console.log('loadingTask created')
  const pdf = await loadingTask.promise
  console.log('PDF loaded, pages:', pdf.numPages)
  const page = await pdf.getPage(1)
  console.log('Page loaded')

  // Get original viewport dimensions at scale 1
  const originalViewport = page.getViewport({ scale: 1 })
  const originalWidth = originalViewport.width
  const originalHeight = originalViewport.height
  console.log('Original size:', originalWidth, originalHeight)

  // Calculate scale to fit the PDF within the full screen (window dimensions)
  const scale = Math.min(window.innerWidth / originalWidth, window.innerHeight / originalHeight)
  console.log('Calculated scale:', scale)

  // Get viewport with the calculated scale
  const viewport = page.getViewport({ scale })
  const canvas = canvasEl.value
  const context = canvas.getContext('2d')

  canvas.height = viewport.height
  canvas.width = viewport.width
  console.log('Canvas size set to:', canvas.width, canvas.height)

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  }

  await page.render(renderContext).promise
  console.log('PDF rendered to canvas')

  // Apply draggable functionality to the canvas after rendering
  interact('.draggable')
    .resizable({
      // resize from all edges and corners
      edges: { left: true, right: true, bottom: true, top: true },

      listeners: {
        move(event) {
          console.log('resizable called')
          var target = event.target
          var x = parseFloat(target.getAttribute('data-x')) || 0
          var y = parseFloat(target.getAttribute('data-y')) || 0

          // update the element's style
          target.style.width = event.rect.width + 'px'
          target.style.height = event.rect.height + 'px'

          // translate when resizing from top or left edges
          x += event.deltaRect.left
          y += event.deltaRect.top

          target.style.transform = 'translate(' + x + 'px,' + y + 'px)'

          target.setAttribute('data-x', x)
          target.setAttribute('data-y', y)
          target.textContent =
            Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height)
        },
      },
      modifiers: [
        // keep the edges inside the parent
        interact.modifiers.restrictEdges({
          outer: 'parent',
        }),

        // minimum size
        interact.modifiers.restrictSize({
          min: { width: 100, height: 25 },
        }),
      ],

      inertia: true,
    })
    .draggable({
      listeners: { move: dragMoveListener },
      inertia: true,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: true,
        }),
      ],
    })
}

onMounted(async () => {})
</script>

<style scoped>
.pdf-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f3f3f3;
  position: relative; /* Ensure parent restriction works */
  width: 100vw;
  height: 100vh;
}
canvas {
  border: 1px solid #ccc;
}
.square {
  position: absolute;
  width: 50px;
  height: 50px;
  background-color: rgba(255, 0, 0, 0.5);
  border: 2px solid red;
  cursor: move;
}
</style>
