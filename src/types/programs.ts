// Interfaces matching the cte-district-programs API response shape

export interface ProgramCatalog {
  id: number
  state_program_code: string
  title: string
  description?: string | null
}

export interface CteDistrictProgram {
  id: number
  cte_district_id: number
  program_id: number
  authorization_date: string | null
  expiration_date: string | null
  active: boolean
  program_catalog: ProgramCatalog
}

export interface Instructor {
  id: number
  first_name: string
  last_name: string
}

export interface CourseCatalog {
  id: number
  course_code: string
  title: string
  description?: string | null
}

export interface SchoolYear {
  id: number
  district_id: number
  startDate: string
  endDate: string
  label: string
}

export interface CourseInstance {
  id: number
  cte_school_id: number
  district_program_id: number
  course_catalog_id: number
  alias: string
  instructorId: number
  school_year_id: number
  term_id: number | null
  course_catalog: CourseCatalog
  program_catalog: ProgramCatalog
  school_year: SchoolYear
  instructor: Instructor
}
