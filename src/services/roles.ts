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
      pageNo: payload.pageNo,
      pageSize: payload.pageSize,
      search: payload.search
    }
  })
}

export async function removeRoles(roles: string[]) {
  return await request('/role', {
    method: 'DELETE',
    data: {
      roles,
    }
  })
}

export async function addRoleToGroups(roleNames: string[], groupNames: string[]) {
  return await request('/group-role', {
    method: 'POST',
    data: {
      roleNames,
      groupNames,
    }
  })
}

export async function addRoleToUsers(userNames: string[], roleNames: string[]) {
  return await request('/user-role', {
    method: 'POST',
    data: {
      userNames,
      roleNames,
    }
  })
} 