<template>
  <div class="text-center pa-4">
    <v-btn @click="dialog = true"> Open Dialog </v-btn>

    <v-dialog v-model="dialog" width="auto">
      <v-card max-width="500" prepend-icon="mdi-upload" title="Upload File">
        <v-card-text>
          <p class="text-body-2 mb-4">
            Ready to upload a file for class <strong>{{ classId }}</strong
            >.
          </p>
          <v-file-input
            v-model="file"
            label="Select file"
            variant="outlined"
            density="comfortable"
            prepend-icon="mdi-paperclip"
            :disabled="uploading"
            show-size
            clearable
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.csv,.txt"
          />
          <div v-if="error" class="mt-1 d-flex align-center error-msg">
            <v-icon size="14" color="error" class="mr-1">mdi-alert-circle</v-icon>{{ error }}
          </div>
          <div v-if="uploadedUrl" class="mt-1 text-caption success-msg">
            Uploaded: <a :href="uploadedUrl" target="_blank" rel="noopener">{{ uploadedUrl }}</a>
          </div>
          <v-progress-linear
            v-if="uploading || progress"
            :model-value="progress"
            height="6"
            class="mt-4"
            color="primary"
            striped
          />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false" :disabled="uploading">Close</v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-upload"
            :loading="uploading"
            :disabled="!file || uploading"
            @click="uploadFile"
            >Upload</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import axios from 'axios'
import api from '@/api'

// Props
const props = defineProps<{
  /** The ID of the class these uploads belong to */
  classId: string | number
}>()

// Expose directly for template
const { classId } = props

// Local state
const dialog = ref(false)

interface UploadResponse {
  url?: string
  [key: string]: any
}

const file = ref<File | null>(null)
const uploadedUrl = ref('')
const uploading = ref(false)
const progress = ref(0)
const error = ref('')

async function uploadFile() {
  if (!file.value || !classId) {
    console.warn('[FileUpload] missing file or classId', { file: !!file.value, classId })
    return
  }
  error.value = ''
  uploading.value = true
  progress.value = 0

  const formData = new FormData()
  formData.append('file', file.value)
  const url = `/${classId}/upload`
  console.log('[FileUpload] uploading to', url)

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
.error-msg {
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  color: #dc2626;
}
.success-msg {
  font-size: 0.7rem;
  color: #16a34a;
  word-break: break-all;
}
</style>
