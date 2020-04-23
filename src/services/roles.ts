import request from '@/utils/request';

interface ICreateRole {
  name: string;
  note: string;
  permissions?: string[]
}

export async function createRole(payload: ICreateRole) {
  return await request('/role', {
    method: 'POST',
    data: payload
  })
}

export async function getRoles(payload: any) {
  return await request('/role', {
    method: 'GET',
    params: {
      pageNo: payload.pageNo || 1,
      pageSize: payload.pageSize,
      search: payload.search
    }
  })
}

export async function removeRoles(roles: number[]) {
  return await request('/role', {
    method: 'DELETE',
    data: {
      roleIds: roles,
    }
  })
}

export async function addRoleToGroups(roleIds: number[], groupIds: number[]) {
  return await request('/group-role', {
    method: 'POST',
    data: {
      roleIds,
      groupIds,
    }
  })
}

export async function addRoleToUsers(userIds: number[], roleIds: number[]) {
  return await request('/user-role', {
    method: 'POST',
    data: {
      userIds,
      roleIds,
    }
  })
}

export async function editRoleToUsers(userId: number, roleIds: number[]) {
  return await request('/user-role', {
    method: 'PATCH',
    data: {
      userId,
      roleIds,
    }
  })
}
