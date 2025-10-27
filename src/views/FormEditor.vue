<template>
  <v-container>
    <v-row>
      <!-- Sidebar -->
      <v-col cols="3">
        <v-list>
          <v-list-item
            v-for="category in categories"
            :key="category"
            :class="{ 'font-weight-bold': selectedCategory === category }"
            @click="selectedCategory = category"
          >
            {{ category }}
          </v-list-item>
        </v-list>
      </v-col>

      <!-- Main Editor -->
      <v-col cols="9">
        <div v-if="skills.length">
          <v-card v-for="skill in skills" :key="skill.id" class="mb-3">
            <v-card-text>
              <v-text-field v-model="skill.name" label="Skill Name" @change="updateSkill(skill)" />
              <v-textarea
                v-model="skill.description"
                label="Description"
                @change="updateSkill(skill)"
              />
            </v-card-text>
            <v-card-actions>
              <v-btn color="red" @click="deleteSkill(skill.id)">Delete</v-btn>
            </v-card-actions>
          </v-card>
        </div>

        <!-- Add New Skill -->
        <v-card>
          <v-card-text>
            <v-text-field v-model="newSkill.name" label="Skill Name" />
            <v-textarea v-model="newSkill.description" label="Description" />
          </v-card-text>
          <v-card-actions>
            <v-btn color="green" @click="addSkill">Add Skill</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import api from '@/api'

const formId = 1 // dynamically set in your app

// Categories
const categories = ['Occupational Skills', 'Industry Skills']
const selectedCategory = ref('Occupational Skills')

// Form data fetched from API
const formData = ref({ occupationalSkills: [], industrySkills: [] })

// New skill form
const newSkill = ref({ name: '', description: '' })

// Computed skills for current category
const skills = computed(() => {
  return selectedCategory.value === 'Occupational Skills'
    ? formData.value.occupationalSkills
    : formData.value.industrySkills
})

// Fetch existing skills on mount
onMounted(async () => {
  const res = await api.get(`/form/${formId}`)
  console.log(res.data)
  formData.value = res.data.form_data
})

// Add skill
async function addSkill() {
  if (!newSkill.value.name) return

  const skillToAdd = { id: uuidv4(), ...newSkill.value }
  const type = selectedCategory.value === 'Occupational Skills' ? 'occupational' : 'industry'

  if (type === 'occupational') {
    formData.value.occupationalSkills.push(skillToAdd)
  } else {
    formData.value.industrySkills.push(skillToAdd)
  }

  await api.post(`/form/${formId}/occupational`, {
    skills: [skillToAdd],
    type,
  })

  newSkill.value = { name: '', description: '' }
}

// Update skill
async function updateSkill(skill) {
  const type = selectedCategory.value === 'Occupational Skills' ? 'occupational' : 'industry'
  await api.put(`/form/${formId}/occupational`, {
    skillId: skill.id,
    updatedFields: skill,
    type,
  })
}

// Delete skill
async function deleteSkill(skillId) {
  const type = selectedCategory.value === 'Occupational Skills' ? 'occupational' : 'industry'

  if (type === 'occupational') {
    formData.value.occupationalSkills = formData.value.occupationalSkills.filter(
      (s) => s.id !== skillId,
    )
  } else {
    formData.value.industrySkills = formData.value.industrySkills.filter((s) => s.id !== skillId)
  }

  await api.delete(`/form/${formId}/occupational`, { data: { skillId, type } })
}
</script>
