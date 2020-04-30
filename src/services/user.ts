import request from '@/utils/request';


export async function queryCurrent(): Promise<any> {
  return request('/auth/currentUser');
}

export async function queryNotices(): Promise<any> {
  return request('/notices');
}
