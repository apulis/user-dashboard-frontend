
import request from '@/utils/request';


export async function getOAuth2Methods() {
  return await request('/auth/oauth2-methods')
}