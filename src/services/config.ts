
import request from '@/utils/request';


export async function getOAuth2Methods() {
  return await request('/auth/oauth2-methods')
}

export async function getAdminUsers() {
  return await request('/users/adminUsers')
}

export async function getPlatformConfig() {
  return await request('/platform-config')
}