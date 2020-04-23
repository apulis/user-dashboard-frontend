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

export async function addUsersToGroups(userIds: number[], groupIds: number[]): Promise<any> {
  return await request('/group-user', {
    method: 'POST',
    data: {
      userIds,
      groupIds,
    }
  })
}


export async function getUserRolesById(userId: number): Promise<{list: {roleId: number; userId: number}[]; success: boolean}> {
  return await request('/user-role/userId/' + userId, {
    method: 'GET'
  })
}