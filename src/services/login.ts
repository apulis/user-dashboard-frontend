import request from '@/utils/request';

export interface LoginParamsType {
  userName: string;
  password: string;
  group: string;
}

export async function logInWithAccount(params: LoginParamsType) {
  return request('/auth/login', {
    method: 'POST',
    data: {
      userName: params.userName,
      password: params.password
    },
  })
}

export async function userLogout() {
  return await request('/auth/logout')
}