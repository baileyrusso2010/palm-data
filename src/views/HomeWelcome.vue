<template>
  <div class="home-page">
    <v-container class="py-10" fluid>
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <div class="central-header mb-8">
            <v-card elevation="4" rounded="xl" class="central-card pa-6">
              <div class="central-title">Monroe/Erie BOCES</div>
              <div class="central-subtitle">Central School District</div>
            </v-card>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <div v-for="school in schools" :key="school.id" class="mb-10">
            <div class="school-title text-h6 font-weight-600 mb-4">{{ school.name }}</div>
            <v-row>
              <v-col
                v-for="classItem in school.classes"
                :key="classItem.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card
                  elevation="3"
                  rounded="xl"
                  class="class-card"
                  @click="goToClass(classItem.id)"
                >
                  <v-card-title class="class-title">{{ classItem.name }}</v-card-title>
                  <v-card-subtitle class="class-teacher"
                    >Teacher: {{ classItem.teacher }}</v-card-subtitle
                  >
                  <v-card-text class="class-students">
                    <v-chip color="primary" variant="tonal" class="student-chip">
                      {{ classItem.students }} students
                    </v-chip>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()

const isLoading = ref(false)
const schools = ref([])

function goToClass(classId) {
  router.push({ name: 'class', params: { id: classId } })
}

onMounted(async () => {
  isLoading.value = true
  try {
    let response = await api.get('/course-instances/')

    Object.keys(response.data).forEach((schoolKey) => {
      const schoolArray = response.data[schoolKey]
      let classes = []
      schoolArray.forEach((item) => {
        classes.push({
          id: item.id,
          name: item.alias,
          teacher: item.instructor?.last_name,
          students: item.enrollmentCount,
        })
      })
      schools.value.push({
        id: schoolKey,
        name: schoolKey,
        classes: classes,
      })
    })
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.home-page {
  background: #fafafa;
  min-height: 100vh;
}
.central-header {
  display: flex;
  justify-content: center;
  align-items: center;
}
.central-card {
  background: linear-gradient(90deg, #e3f0ff 0%, #f8faff 100%);
  border: 1px solid #c3dafe;
  box-shadow: 0 8px 32px 0 rgba(60, 72, 88, 0.1);
  text-align: center;
}
.central-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1a2330;
  font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif;
  margin-bottom: 0.5rem;
}
.central-subtitle {
  font-size: 1.1rem;
  color: #4a5a6a;
  font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif;
}
.dashboard-header {
  width: 100%;
  background: #f5f7fa;
  border-bottom: 1px solid #e0e3e7;
  padding: 32px 0 24px 0;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #222b45;
  margin: 0;
  font-family: 'Segoe UI', 'Montserrat', Arial, sans-serif;
}
.font-weight-600 {
  font-weight: 600;
}
.school-title {
  color: #2a3a4d;
  font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif;
}
.class-card {
  transition: box-shadow 0.2s;
  border: 1px solid #e0e3e7;
  background: #fff;
  margin-bottom: 16px;
}
.class-card:hover {
  box-shadow: 0 6px 24px 0 rgba(60, 72, 88, 0.12);
}
.class-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #1a2330;
}
.class-teacher {
  font-size: 0.95rem;
  color: #4a5a6a;
}
.class-students {
  margin-top: 8px;
}
.student-chip {
  font-size: 0.9rem;
  font-weight: 500;
}
</style>
