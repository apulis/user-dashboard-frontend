import request from '@/utils/request';
import { IAddUserGroup } from '@/pages/admin/Groups/Add'


export async function addGroup(payload: IAddUserGroup): Promise<any> {
  return await request('/group', {
    method: 'POST',
    data: payload
  });
}

export async function removeGroup(groupIds: number[]): Promise<any> {
  return await request('/group ', {
    method: 'DELETE',
    data: {
      groupIds: groupIds
    }
  });
}

export async function getGroups(payload: {search: string}) {
  return await request('/group/list', {
    method: 'GET',
    params: {
      search: payload.search
    }
  })
}

export async function getGroupDetail(groupId: number) {
  return await request('/group/' + groupId);
}

export async function getGroupUsers(groupId: number) {
  return await request('/group-user/users?groupId=' + groupId);
}

export async function getGroupRoles(groupId: number) {
  return await request('/group-role/roles?groupId=' + groupId);
}

export async function editGroupDetail(id: number, payload: { name:string; note: string;}) {
  return await request('/group/' + id, {
    method: 'PATCH',
    data: {
      ...payload
    }
  })
}

export async function removeGroupRole(groupId: number, roleId: number) {
  return await request('/group-role/' + groupId, {
    method: 'DELETE',
    params: {
      roleId
    }
  })
}

export async function removeGroupUser(groupId: number, userId: number) {
  return await request('/group-user/' + groupId, {
    method: 'DELETE',
    params: {
      userId,
    }
  })
}