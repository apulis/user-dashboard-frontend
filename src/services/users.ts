import request from '@/utils/request';

interface IFetchUserPayload {
  pageSize: number;
  pageNo: number;
}

export async function fetchUsers(payload: IFetchUserPayload): Promise<any> {
  return await request('/users/list', {
    params: payload
  });
}

export async function createUsers(payload: any) {
  return await request('/users', {
    method: 'POST',
    data: payload
  })
}

export async function removeUsers(payload: string[]) {
  return await request('/users', {
    method: 'DELETE',
    data: payload,
  })
}

export async function addUsersToGroups(userNames: string[], groupNames: string[]): Promise<any> {
  return await request('/group-user', {
    method: 'POST',
    data: {
      userNames,
      groupNames,
    }
  })
}