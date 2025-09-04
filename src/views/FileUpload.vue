<template>
  <div class="upload">
    <h2>Upload PDF to Class</h2>
    <div class="field">
      <label>Select Class</label>
      <select v-model="classId">
        <option disabled value="">Select a Class</option>
        <option v-for="cls in classes" :key="cls.id" :value="cls.id">
          {{ cls.name }}
        </option>
      </select>
    </div>
    <div class="field">
      <label>PDF File</label>
      <input type="file" @change="onFileChange" accept="application/pdf" />
    </div>
    <button @click="uploadFile" :disabled="!file || !classId || uploading">
      {{ uploading ? `Uploading ${progress}%` : 'Upload' }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="uploadedUrl">
      Uploaded: <a :href="uploadedUrl" target="_blank" rel="noopener">{{ uploadedUrl }}</a>
    </p>
  </div>
  <ul>
    <li v-for="file in files" :key="file.key">
      <a :href="file.url" target="_blank"> {{ file.key }} </a>
    </li>
  </ul>
</template>

<script setup lang="ts">
import api from '../api'
import { ref } from 'vue'
import { onMounted } from 'vue'

interface ListedFile {
  key: string
  url: string
  [k: string]: any
}
const files = ref<ListedFile[]>([])

onMounted(() => {})

interface ClassOption {
  id: string
  name: string
}
interface UploadResponse {
  url?: string
  [key: string]: any
}

const file = ref<File | null>(null)
const classId = ref('3')
const uploadedUrl = ref('')
const uploading = ref(false)
const progress = ref(0)
const error = ref('')
const classes = ref<ClassOption[]>([
  { id: 'math101', name: 'Math 101' },
  { id: 'eng202', name: 'English 202' },
])

// Debug initial state
console.log('[FileUpload] mounted script setup', {
  env: import.meta.env.VITE_API_BASE_URL,
  defaultClassId: classId.value,
})

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  file.value = input.files && input.files[0] ? input.files[0] : null
  error.value = ''
  progress.value = 0
  console.log(
    '[FileUpload] file change',
    file.value ? { name: file.value.name, size: file.value.size } : 'no file',
  )
}

async function uploadFile() {
  if (!file.value || !classId.value) {
    console.warn('[FileUpload] missing file or classId', {
      file: !!file.value,
      classId: classId.value,
    })
    return
  }
  error.value = ''
  uploading.value = true
  progress.value = 0

  const formData = new FormData()
  formData.append('file', file.value)
  const url = `/3/upload`
  console.log('[FileUpload] uploading to', url, '(resolved via api baseURL)')

  try {
    const res = await api.put<UploadResponse>(url, formData, {
      onUploadProgress: (e) => {
        if (e.total) {
          progress.value = Math.round((e.loaded / e.total) * 100)
          console.log('[FileUpload] progress', progress.value, e.loaded, '/', e.total)
        }
      },
    })
    uploadedUrl.value = res.data.url || ''
    console.log('[FileUpload] success', res.data)
    file.value = null
  } catch (err: any) {
    if (err?.response) {
      error.value =
        `Upload failed (${err.response.status})` +
        (err.response.data?.message ? `: ${err.response.data.message}` : '')
      // eslint-disable-next-line no-console
      console.error('Upload failed:', err.response.status, err.response.data)
    } else {
      error.value = 'Upload failed'
      // eslint-disable-next-line no-console
      console.error('Upload error:', err?.message || err)
    }
  } finally {
    console.log('[FileUpload] finished upload')
    uploading.value = false
    setTimeout(() => (progress.value = 0), 1500)
  }
}
</script>

<style scoped>
.upload {
  max-width: 420px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
select,
input[type='file'] {
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
button {
  padding: 0.6rem 1rem;
  border: none;
  background: #2563eb;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}
.error {
  color: #dc2626;
  font-size: 0.875rem;
}
</style>
