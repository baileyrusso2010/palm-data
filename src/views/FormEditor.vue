<template>
  <v-container class="pa-6 d-flex justify-center">
    <v-sheet elevation="6" max-width="1500" width="100%" class="pa-6 rounded-lg">
      <h2 class="text-h5 font-weight-medium mb-6 text-center">Employability Profile Skills</h2>

      <v-form ref="form">
        <v-table density="comfortable" class="elevation-1 rounded-lg">
          <thead class="bg-grey-lighten-4">
            <tr>
              <th class="text-left px-4 py-3">Title</th>
              <th class="text-left px-4 py-3">Description</th>
              <th class="text-left px-4 py-3">Status</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(item, index) in desserts"
              :key="index"
              class="hover:bg-grey-lighten-5 transition-all"
            >
              <td class="px-4 py-3 align-middle">
                <v-text-field
                  v-model="item.title"
                  variant="outlined"
                  density="compact"
                  hide-details
                  placeholder="Enter title"
                  class="mt-1"
                  :rules="rules"
                />
              </td>

              <td class="px-4 py-3 align-middle">
                <v-text-field
                  v-model="item.description"
                  variant="outlined"
                  density="compact"
                  hide-details
                  placeholder="Enter description"
                  class="mt-1"
                  required
                  :rules="rules"
                />
              </td>

              <td class="px-4 py-3 align-middle">
                <v-select
                  v-model="item.status"
                  :items="statusOptions"
                  variant="outlined"
                  density="compact"
                  hide-details
                  placeholder="Select status"
                  class="mt-1"
                  required
                  :rules="rules"
                />
              </td>

              <!-- <td class="text-center px-4 py-3 align-middle">
                <v-btn
                  icon="mdi-delete"
                  color="error"
                  variant="text"
                  @click="removeRow(index)"
                ></v-btn>
              </td> -->
            </tr>
          </tbody>
        </v-table>
      </v-form>

      <v-row class="mt-6" justify="center" align="center" dense>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" class="mx-2" @click="addRow">
          Add Row
        </v-btn>
        <v-btn
          color="success"
          variant="flat"
          prepend-icon="mdi-content-save"
          class="mx-2"
          @click="save"
        >
          Save
        </v-btn>
      </v-row>
    </v-sheet>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

const form = ref(null)
const rules = [(v) => !!v || 'This field is required']

const desserts = ref([
  {
    title: 'Act as a responsible and Con',
    description: 'Career ready individuals',
    status: 'Active',
  },
  {
    title: 'Work Productively in teams',
    description: 'Career ready individuals',
    status: 'Inactive',
  },
])

const statusOptions = ['Active', 'Inactive']

function addRow() {
  const _desert = desserts.value[desserts.value.length - 1]
  if (_desert.title !== '' && _desert.description !== '')
    desserts.value.push({ title: '', description: '', status: 'Active' })
}

function removeRow(index) {
  // desserts.value.splice(index, 1)
}

function save() {
  const { valid } = form.value.validate()

  if (valid) {
  } else {
    console.log('vlaid')
  }
}
</script>
