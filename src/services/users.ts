import request from '@/utils/request';


export async function fetchUsers(pageNo: number, pageSize: number): Promise<any> {
  return request('/users/list', {
    params: {
      pageNo,
      pageSize,
    }
  });
}

export async function createUsers(payload: any) {
  return request('/users', {
    method: 'POST',
    data: payload
  })
}
