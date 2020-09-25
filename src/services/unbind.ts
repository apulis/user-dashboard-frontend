import request from '@/utils/request';



export async function unbindMicrosoft(userId: number) {
  return request(`users/${userId}/unbind/microsoft`, {
    method: 'PUT',
  })
}

export async function unbindWechat(userId: number) {
  return request(`users/${userId}/unbind/microsoft`, {
    method: 'PUT',
  })
}
