<template>
  <v-container class="py-8" fluid>
    <v-card class="mx-auto" max-width="720">
      <v-card-title class="py-4 d-flex align-center gap-3">
        <v-icon>mdi-file-upload</v-icon>
        <span class="text-subtitle-1">Upload Files</span>
      </v-card-title>
      <v-divider />
      <v-card-text class="pt-6">
        <v-alert type="info" variant="tonal" density="comfortable" class="mb-6">
          Select one or more PDF files to upload. Max size per file: {{ prettyMaxSize }}.
        </v-alert>

        <div class="mb-4">
          <v-file-input
            v-model="files"
            label="Select PDF files"
            multiple
            show-size
            counter
            accept="application/pdf,.pdf"
            variant="outlined"
            density="comfortable"
            prepend-icon="mdi-file-pdf-box"
            :rules="fileRules"
            @change="onFilesChanged"
          />
        </div>

        <v-progress-linear v-if="uploading" indeterminate color="primary" height="4" class="mb-4" />

        <v-alert v-if="error" type="error" variant="tonal" density="comfortable" class="mb-4">
          {{ error }}
        </v-alert>
        <v-alert
          v-if="successMessage"
          type="success"
          variant="tonal"
          density="comfortable"
          class="mb-4"
        >
          {{ successMessage }}
        </v-alert>

        <div v-if="files && files.length" class="mb-2">
          <div class="text-caption text-medium-emphasis mb-1">Files Selected</div>
          <v-table density="comfortable" class="file-table">
            <thead>
              <tr>
                <th class="text-left">Name</th>
                <th class="text-left" style="width: 110px">Size</th>
                <th class="text-left" style="width: 90px">Status</th>
                <th style="width: 48px"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in filesDisplay" :key="f.id">
                <td class="text-body-2">
                  <v-icon size="16" class="mr-1" color="red-darken-2">mdi-file-pdf-box</v-icon>
                  {{ f.file.name }}
                </td>
                <td class="text-caption">{{ formatBytes(f.file.size) }}</td>
                <td class="text-caption">
                  <v-chip
                    v-if="f.status !== 'error'"
                    :color="f.status === 'uploaded' ? 'success' : 'grey'"
                    size="x-small"
                    label
                    class="text-caption"
                  >
                    {{ f.status === 'pending' ? 'Pending' : 'Uploaded' }}
                  </v-chip>
                  <v-tooltip v-else text="Upload failed">
                    <template #activator="{ props }">
                      <v-icon v-bind="props" size="16" color="error">mdi-alert-circle</v-icon>
                    </template>
                  </v-tooltip>
                </td>
                <td>
                  <v-btn
                    icon="mdi-close"
                    size="x-small"
                    variant="text"
                    @click="removeFile(f.id)"
                    :disabled="uploading"
                  />
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" :disabled="uploading" @click="resetAll">Reset</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!files || !files.length || uploading || hasRuleErrors"
          :loading="uploading"
          @click="uploadFiles"
          prepend-icon="mdi-cloud-upload"
        >
          Upload
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

interface UploadDisplayItem {
  id: string
  file: File
  status: 'pending' | 'uploaded' | 'error'
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

const files = ref<File[] | null>(null)
const filesDisplay = ref<UploadDisplayItem[]>([])
const uploading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref('')

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

const fileRules = [
  (val: any) => {
    if (!val || !val.length) return true
    for (const f of val) {
      if (f.type !== 'application/pdf') return 'All files must be PDF'
      if (f.size > MAX_FILE_SIZE) return `Max file size is ${prettyMaxSize}`
    }
    return true
  },
]

const hasRuleErrors = computed(() => {
  const ruleResult = fileRules[0](files.value)
  return ruleResult !== true
})

const prettyMaxSize = computed(() => `${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)} MB`)

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function onFilesChanged() {
  filesDisplay.value = (files.value || []).map((f) => ({ id: uuid(), file: f, status: 'pending' }))
  successMessage.value = ''
  error.value = null
}

function removeFile(id: string) {
  filesDisplay.value = filesDisplay.value.filter((f) => f.id !== id)
  files.value = filesDisplay.value.map((f) => f.file)
}

function resetAll() {
  files.value = null
  filesDisplay.value = []
  uploading.value = false
  error.value = null
  successMessage.value = ''
}

async function mockUpload(file: File) {
  // Simulate network latency & pretend success
  await new Promise((res) => setTimeout(res, 600 + Math.random() * 800))
  // Could throw to simulate error: if (Math.random() < 0.05) throw new Error('Random fail')
}

async function uploadFiles() {
  if (!filesDisplay.value.length) return
  uploading.value = true
  error.value = null
  successMessage.value = ''

  try {
    for (const item of filesDisplay.value) {
      try {
        await mockUpload(item.file)
        item.status = 'uploaded'
      } catch (e) {
        item.status = 'error'
      }
    }
    if (filesDisplay.value.some((f) => f.status === 'error')) {
      error.value = 'Some files failed to upload.'
    } else {
      successMessage.value = 'All files uploaded successfully.'
    }
  } catch (e: any) {
    error.value = e.message || 'Upload failed'
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.file-table thead th {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.file-table tbody tr:hover {
  background: #f8fafc;
}
</style>
