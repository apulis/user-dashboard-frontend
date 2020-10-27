
import request from '@/utils/request';


export function getOAuth2Methods() {
  return request('/auth/methods')
}

export function getAdminUsers() {
  return request('/users/adminUsers')
}

export async function getPlatformConfig() {
  return request('/platform-config')
}