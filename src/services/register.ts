import request from '@/utils/request';

export interface SignUpParamsType {
  userName: string;
  password: string;
  nickName: string;
  microsoftId?: string;
  wechatId?: string;
}

export async function signUp(params: SignUpParamsType) {
  return request('/auth/register', {
    method: 'POST',
    data: {
      userName: params.userName,
      password: params.password,
      nickName: params.nickName,
      microsoftId: params.microsoftId,
      wechatId: params.wechatId,
    },
  });
}
