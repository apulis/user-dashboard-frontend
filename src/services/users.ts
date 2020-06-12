import request from '@/utils/request';
import { IUserMessage } from '@/pages/admin/User/Add';
import { encodePassword } from '@/utils/utils';

interface IFetchUserPayload {
  pageSize: number;
  pageNo: number;
}

interface ICreateUser {
  userMessage: IUserMessage[],
  userRole: number[]
}

export async function fetchUsers(payload: IFetchUserPayload): Promise<any> {
  return await request('/users/list', {
    params: payload
  });
}

export async function createUsers(payload: ICreateUser) {
  payload.userMessage.forEach(u => {
    u.password = encodePassword(u.password as string);
  })
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

export async function getUserById(id: number) {
  return await request('/users/detail/' + id);
}

export interface IEditUserInfo {
  nickName: string;
  phone: string;
  note: string;
  email: string;
}

export async function editUserInfo(id: number, userInfo: IEditUserInfo) {
  return await request('/users/' + id, {
    method: 'PATCh',
    data: userInfo
  })
}

export async function removeUserRole(userId: number, roleId: number) {
  return await request('/user-role/' + userId, {
    method: 'DELETE',
    params: {
      roleId: roleId
    }
  })
}

export async function getUserRoleInfo(userId: number) {
  return await request(`/user-role/${userId}/info`, {
    method: 'GET',
  });
}


export async function getUserGroups(userId: number) {
  return await request('/group-user/group-info', {
    method: 'GET',
    params: {
      userId,
    }
  })
}

export async function getTotalUsersCount() {
  return await request('/users/count', {
    method: 'GET'
  });
}

export async function resetPassword(userId: number, newPassword: string) {
  return await request(`/users/${userId}/resetPassword`, {
    method: 'PATCH',
    data: {
      newPassword: encodePassword(newPassword),
    }
  })
}