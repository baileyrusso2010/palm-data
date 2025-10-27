<template>
  <div class="container">
    <div class="inputs">
      <v-btn @click="save">Save</v-btn>
      <v-text-field
        v-model="textFieldValue"
        label="JR Year Final Grade"
        variant="outlined"
        @update:focused="testing"
      ></v-text-field>
      <v-text-field
        v-model="textFieldValue2"
        label="SR Year Final Grade"
        variant="outlined"
        @update:focused="testing"
      ></v-text-field>
      <v-text-field
        v-model="studentFirstNameValue"
        label="Student First Name"
        variant="outlined"
        @update:focused="testing"
      ></v-text-field>
      <v-text-field
        v-model="studentLastNameValue"
        label="Student Last Name"
        variant="outlined"
        @update:focused="testing"
      ></v-text-field>
      <v-text-field
        v-model="schoolDistrictValue"
        label="School District"
        variant="outlined"
        @update:focused="testing"
      ></v-text-field>
      <v-text-field
        v-model="studentIdValue"
        label="Student ID"
        variant="outlined"
        @update:focused="testing"
      ></v-text-field>
      <v-text-field
        v-model="schoolYearsValue"
        label="School Years"
        variant="outlined"
        @update:focused="testing"
      ></v-text-field>
      <v-text-field
        v-model="cteSchoolValue"
        label="CTE School"
        variant="outlined"
        @update:focused="testing"
      ></v-text-field>
      <v-text-field
        v-model="avgJrSem1Value"
        label="Jr Sem 1 Performance Avg"
        variant="outlined"
        @update:focused="testing"
      ></v-text-field>
      <v-text-field
        v-model="avgJrSem2Value"
        label="Jr Sem 2 Performance Avg"
        variant="outlined"
        @update:focused="testing"
      ></v-text-field>
      <v-text-field
        v-model="avgSrSem1Value"
        label="Sr Sem 1 Performance Avg"
        variant="outlined"
        @update:focused="testing"
      ></v-text-field>
      <v-text-field
        v-model="avgSrSem2Value"
        label="Sr Sem 2 Performance Avg"
        variant="outlined"
        @update:focused="testing"
      ></v-text-field>
      <v-text-field
        v-model="avgJrSem1TechValue"
        label="Jr Sem 1 Technical Avg"
        variant="outlined"
        @update:focused="testing"
      ></v-text-field>
      <v-text-field
        v-model="avgJrSem2TechValue"
        label="Jr Sem 2 Technical Avg"
        variant="outlined"
        @update:focused="testing"
      ></v-text-field>
      <v-text-field
        v-model="avgSrSem1TechValue"
        label="Sr Sem 1 Technical Avg"
        variant="outlined"
        @update:focused="testing"
      ></v-text-field>
      <v-text-field
        v-model="avgSrSem2TechValue"
        label="Sr Sem 2 Technical Avg"
        variant="outlined"
        @update:focused="testing"
      ></v-text-field>
      <v-text-field
        v-model="commentsValue"
        label="Comments"
        variant="outlined"
        @update:focused="testing"
      ></v-text-field>
      <v-btn @click="togglePdf">{{ pdfVisible ? 'Hide PDF' : 'Show PDF' }}</v-btn>
    </div>
    <transition name="slide-fade">
      <div v-if="pdfVisible" class="pdf-viewer">
        <canvas ref="pdfCanvas"></canvas>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick, watch } from 'vue'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const pdfCanvas = ref(null)
const hasFocused = ref(false)
const textFieldValue = ref('')
const textFieldValue2 = ref('')
const pdfVisible = ref(true)
const lastPdfBytes = ref(null)

const studentFirstNameValue = ref('Bailey')
const studentLastNameValue = ref('Russo')
const schoolDistrictValue = ref('Orleans/Niagra Boces')
const studentIdValue = ref('032923')
const schoolYearsValue = ref('2025-2026')
const cteSchoolValue = ref('Niagra Boces')
const avgJrSem1Value = ref('3')
const avgJrSem2Value = ref('3')
const avgSrSem1Value = ref('3')
const avgSrSem2Value = ref('3')
const avgJrSem1TechValue = ref('3')
const avgJrSem2TechValue = ref('3')
const avgSrSem1TechValue = ref('3')
const avgSrSem2TechValue = ref('3')
const commentsValue = ref('hflslfjdsfljdsfsdlkfjlj')

watch(pdfVisible, (newVal) => {
  if (newVal && lastPdfBytes.value) {
    console.log('In HERE')
    nextTick(async () => {
      try {
        const existinPDF = '/Animal_Full.pdf'
        const existingPdfBytes = await fetch(existinPDF).then((res) => res.arrayBuffer())
        const pdfDoc = await PDFDocument.load(existingPdfBytes)
        const pdfBytes = await pdfDoc.save()
        lastPdfBytes.value = pdfBytes
        await showPDF(pdfBytes)
        save()
      } catch (e) {
        console.error('Error loading PDF:', e)
        pdfVisible.value = false
      }
    })
  }
})

function togglePdf() {
  pdfVisible.value = !pdfVisible.value
}

function testing() {
  hasFocused.value = !hasFocused.value
  if (!hasFocused.value) {
    save()
  }
}

async function showPDF(pdfSource) {
  let loadingTask
  if (pdfSource instanceof ArrayBuffer) {
    loadingTask = pdfjsLib.getDocument({ data: pdfSource })
  } else {
    loadingTask = pdfjsLib.getDocument(pdfSource)
  }

  const pdf = await loadingTask.promise
  const page = await pdf.getPage(1)

  const annotations = await page.getAnnotations()

  // Filter form field annotations and get their top Y (rect[3] is top Y in pdfjsLib)
  const fieldsWithPosition = annotations
    .filter((ann) => ann.subtype === 'Widget' && ann.fieldName)
    .map((ann) => ({
      name: ann.fieldName,
      topY: ann.rect[3], // Top Y coordinate
    }))

  // Sort from top to bottom (descending topY)
  fieldsWithPosition.sort((a, b) => b.topY - a.topY)

  // Log the sorted list
  console.log(
    'Fields from top to bottom:',
    fieldsWithPosition.map((f) => f.name),
  )

  const viewport = page.getViewport({ scale: 1.0 }) // smaller scale for smaller right side
  const canvas = pdfCanvas.value
  if (!canvas) return
  const context = canvas.getContext('2d')

  canvas.height = viewport.height
  canvas.width = viewport.width

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  }

  await page.render(renderContext).promise
}

onMounted(async () => {
  try {
    const existinPDF = '/Animal_Full.pdf'
    const existingPdfBytes = await fetch(existinPDF).then((res) => res.arrayBuffer())
    const pdfDoc = await PDFDocument.load(existingPdfBytes)
    const pdfBytes = await pdfDoc.save()
    lastPdfBytes.value = pdfBytes
    await showPDF(pdfBytes)
  } catch (e) {
    console.error('Error loading PDF:', e)
    // Optionally, you can set pdfVisible to false or show an error message to the user
    pdfVisible.value = false
  }
})

async function save() {
  const existinPDF = '/Animal_Full.pdf'
  const existingPdfBytes = await fetch(existinPDF).then((res) => res.arrayBuffer())
  const pdfDoc = await PDFDocument.load(existingPdfBytes)
  const field1 = pdfDoc.getForm().getTextField('GRADE AVERAGESchool Year 1 Junior')
  const field2 = pdfDoc.getForm().getTextField('GRADE AVERAGESchool Year 2 Senior')
  const total = pdfDoc.getForm().getTextField('GRADE AVERAGECumulative Grade')

  const studentLastName = pdfDoc.getForm().getTextField('Student Last Name')
  const studentFirstName = pdfDoc.getForm().getTextField('Student First Name')
  const schoolDistrict = pdfDoc.getForm().getTextField('School_District')
  const student_id = pdfDoc.getForm().getTextField('Student_ID')
  const schoolYears = pdfDoc.getForm().getTextField('School_Years')
  const cteSchool = pdfDoc.getForm().getTextField('CTE_School')
  const avg_jr_sem1 = pdfDoc.getForm().getTextField('AVG_Jr._Sem_1_Performance_Skills_Avg')
  const avg_jr_sem2 = pdfDoc.getForm().getTextField('AVG_Jr._Sem_2_Performance_Skills_Avg')
  const avg_sr_sem1 = pdfDoc.getForm().getTextField('AVG_Sr._Sem_1_Performance_Skills_Avg')
  const avg_sr_sem2 = pdfDoc.getForm().getTextField('AVG_Sr._Sem_2_Performance_Skills_Avg')

  const avg_jr_sem1_tech = pdfDoc.getForm().getTextField('AVG_Jr._Sem_1_Technical_Skills_Avg')
  const avg_jr_sem2_tech = pdfDoc.getForm().getTextField('AVG_Jr._Sem_2_Technical_Skills_Avg')
  const avg_sr_sem1_tech = pdfDoc.getForm().getTextField('AVG_Sr._Sem_1_Technical_Skills_Avg')
  const avg_sr_sem2_tech = pdfDoc.getForm().getTextField('AVG_Sr._Sem_2_Technical_Skills_Avg')
  const comments = pdfDoc.getForm().getTextField('Comments')

  studentFirstName.setText(studentFirstNameValue.value)
  studentLastName.setText(studentLastNameValue.value)
  schoolDistrict.setText(schoolDistrictValue.value)
  student_id.setText(studentIdValue.value)
  schoolYears.setText(schoolYearsValue.value)
  cteSchool.setText(cteSchoolValue.value)

  avg_jr_sem1.setText(avgJrSem1Value.value)
  avg_jr_sem2.setText(avgJrSem2Value.value)
  avg_sr_sem1.setText(avgSrSem1Value.value)
  avg_sr_sem2.setText(avgSrSem2Value.value)

  avg_jr_sem1_tech.setText(avgJrSem1TechValue.value)
  avg_jr_sem2_tech.setText(avgJrSem2TechValue.value)
  avg_sr_sem1_tech.setText(avgSrSem1TechValue.value)
  avg_sr_sem2_tech.setText(avgSrSem2TechValue.value)

  comments.setText(commentsValue.value)

  // const buttons = fields.filter(field => field instanceof PDFButton);

  let x = textFieldValue.value
  let y = textFieldValue2.value

  field1.setText(x.toString())
  field2.setText(y.toString())
  total.setText(Math.round((Number(x) + Number(y)) / 2).toString())

  const pdfBytes = await pdfDoc.save()
  lastPdfBytes.value = pdfBytes
  await showPDF(pdfBytes)
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  height: 100vh;
}
.inputs {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  height: 100vh;
  overflow-y: auto;
  padding: 1rem;
}
.pdf-viewer {
  flex: 0.8;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f4f4f4;
  padding: 1rem;
  min-width: 280px;
  height: 100vh;
}
canvas {
  border: 1px solid #ccc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
</style>
