import { defineStore } from 'pinia'

export const useSchoolStore = defineStore('school', {
  state: () => ({
    district: null, //{ id, name }
    school: null, //{ id, name }
    grade: null, //{ id, name }
    term: null, //{ id, name }
  }),
  actions: {
    setDistrict(district: any) {
      this.district = district //resets on selection
      this.school = null
      this.grade = null
      this.term = null
    },
    setSchool(school: any) {
      this.school = school //resets on selection
      this.grade = null
      this.term = null
    },
    setGrade(grade: any) {
      this.grade = grade
    },
    setTerm(term: any) {
      this.term = term
    },
  },
})
