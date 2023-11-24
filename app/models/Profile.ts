export interface Profile {
  id: number
  username: string
  country: string
  school: string
  languages: any[]
  created_at: string
  level: number
  deleted: boolean
  is_admin: boolean
  support_admin: boolean
  avatar: string
  website: string
  short_bio: string
  username_change_count: string
  name: string
  personal_first_name: string
  personal_last_name: string
  company: string
  local_language: string
  has_avatar_url: boolean
  hide_account_checklist: string
  spam_user: string
  job_title: string
  jobs_headline: string
  linkedin_url: string
  github_url: string
  self: boolean
  title: string
  event_count: number
  online: boolean
  is_following: boolean
  is_followed: boolean
  followers_count: number
}
