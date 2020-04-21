import request from '@/utils/request';
import { IAddUserGroup } from '@/pages/admin/Groups/Add'


export async function addGroup(payload: IAddUserGroup): Promise<any> {
  return await request('/group', {
    method: 'POST',
    data: payload
  });
}

export async function removeGroup(name: string | string[]): Promise<any> {
  return await request('/group ', {
    method: 'DELETE',
    data: {
      groupNames: name
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