<template>
  <header class="dashboard-header">
    <h1>CTE Industry and Technical Skills</h1>
  </header>
  <div class="center-table-container">
    <ag-grid-vue
      :theme="gridTheme"
      :rowData="rowData"
      :columnDefs="colDefs"
      :defaultColDef="defaultColDef"
      :suppressKeyboardEvent="suppressKeyboardEvent"
      :stopEditingWhenCellsLoseFocus="false"
      @cell-focused="onCellFocused"
      style="
        height: 500px;
        --ag-header-height: 48px;
        --ag-row-height: 42px;
        --ag-list-item-height: 24px;
        min-width: 1200px;
      "
    />
    <div style="margin-top: 16px; display: flex; gap: 12px; justify-content: center">
      <v-btn @click="save">Save</v-btn>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { gridTheme } from '@/gridTheme'
import api from '@/api'

const isLoading = ref(false)

onMounted(() => {
  fetchData()
})
function onCellFocused(e) {
  if (!e?.column) return
  const colId = e.column.getColId ? e.column.getColId() : e.column.colId
  if (colId === 'comments' && (e.source === 'keyboard' || !('source' in e))) {
    // defer so focus settles before starting edit
    setTimeout(() => {
      e.api.startEditingCell({ rowIndex: e.rowIndex, colKey: 'comments' })
    }, 0)
  }
}
function suppressKeyboardEvent(params) {
  const e = params.event
  if (e.key === 'Tab' && params.colDef?.field === 'comments') {
    e.preventDefault()
    if (!params.editing) {
      params.api.startEditingCell({ rowIndex: params.node.rowIndex, colKey: 'comments' })
    }
    return true // tell AG Grid we handled it
  }
  return false
}

async function save() {
  try {
    const payload = []
    rowData.value.forEach((item) => {
      payload.push({
        id: item.semester12.id, // null or existing
        skill_id: item.id,
        period: 'Semester 1',
        score: item.semester12.score,
        comment: item.comments, // or item.semester12.comment if you have per-semester comments
      })
      // Semester 3-4
      payload.push({
        id: item.semester34.id, // null or existing
        skill_id: item.id,
        period: 'Semester 3',
        score: item.semester34.score,
        comment: item.comments, // or item.semester34.comment
      })
    })

    const response = await api.post('/skill/skillscore/bulk-upsert', payload)
    console.log(response)
  } catch (err) {
    console.error('Error saving data: ', err)
  }
}

async function fetchData() {
  isLoading.value = true

  try {
    //api

    let response = await api.get('/skill/student/1')
    console.log(response)

    Object.values(response.data).forEach((item) => {
      const semester1Score = item.SkillScores.find((s) => s.period === 'Semester 1') || {}
      const semester3Score = item.SkillScores.find((s) => s.period === 'Semester 3') || {}

      rowData.value.push({
        id: item.id,
        title: item.title,
        description: item.description,
        semester12: {
          score: semester1Score.score || '',
          id: semester1Score.id ?? null,
        },
        semester34: {
          score: semester3Score.score || '',
          id: semester3Score.id ?? null,
        },
        comments: semester1Score.comment, // or however you want to handle general comments
      })
    })
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const rowData = ref([])

const colDefs = ref([
  { field: 'title', headerName: 'Industry & Tech Skills', editable: false },
  {
    field: 'description',
    header: 'Industry & Technical Expectations',
    width: 400, // Increase width as needed
    editable: false,
  },
  {
    field: 'semester12',
    header: 'Semester 1-2',
    editable: true,
    valueGetter: (params) => params.data.semester12?.score ?? '',
    valueSetter: (params) => {
      params.data.semester12 = {
        ...params.data.semester12,
        score: params.newValue,
      }
      return true
    },
  },
  {
    field: 'semester34',
    header: 'Semester 3-4',
    editable: true,

    field: 'semester34',
    headerName: 'Semester 3-4',
    editable: true,
    valueGetter: (params) => params.data.semester34?.score ?? '',
    valueSetter: (params) => {
      params.data.semester34 = {
        ...params.data.semester34,
        score: params.newValue,
      }
      return true
    },
  },
  {
    field: 'comments',
    header: 'Comments',
    editable: true,
    cellEditor: 'agLargeTextCellEditor',
    cellEditorParams: {
      maxLength: 500,
      rows: 6,
      cols: 50,
      suppressTab: true,
    },
  },
])

const defaultColDef = {
  editable: true,
}
</script>

<style scoped>
.center-table-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.dashboard-header {
  width: 100%;
  background: #f5f7fa;
  border-bottom: 1px solid #e0e3e7;
  padding: 32px 0 24px 0;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dashboard-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #222b45;
  letter-spacing: 0.02em;
  margin: 0;
  font-family: 'Segoe UI', 'Montserrat', Arial, sans-serif;
}
.dashboard-header {
  width: 100%;
  background: #f5f7fa;
  border-bottom: 1px solid #e0e3e7;
  padding: 32px 0 24px 0;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dashboard-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #222b45;
  letter-spacing: 0.02em;
  margin: 0;
  font-family: 'Segoe UI', 'Montserrat', Arial, sans-serif;
}
</style>
