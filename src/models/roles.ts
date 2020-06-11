import { Reducer } from 'redux';
import { Effect } from 'dva';

import { getRoles, getRolesCount, getAllPermissions } from '@/services/roles';

export interface IRoleListItem {
  name: string;
  note: string;
  isPreset: number;
  id: number;
}


export interface RolesStateType {
  list: IRoleListItem[];
  search: string;
  total: number;
  permissions: any[];
}

export interface RolesModelType {
  namespace: 'roles';
  state: RolesStateType;
  effects: {
    fetchRoles: Effect;
    getRolesTotalCount: Effect;
    fetchAllPermissions: Effect;
  };
  reducers: {
    saveRoles: Reducer;
    savePermissions: Reducer;
  };
}

const RolesModel: RolesModelType = {
  namespace: 'roles',
  state: {
    list: [],
    search: '',
    total: 0,
    permissions: []
  },
  effects: {
    * fetchRoles({ payload = {} }, { call, put }) {
      const res = yield call(getRoles, payload);
      if (res.success) {
        yield put({
          type: 'saveRoles',
          payload: {
            list: res.list,
            total: res.total 
          }
        })
      }
    },
    * getRolesTotalCount({ payload = {} }, { call, put }) {
      const res = yield call(getRolesCount);
      if (res.success) {
        yield put({
          type: 'saveRoles',
          payload: {
            total: res.count
          }
        })
      }
    },
    * fetchAllPermissions({ payload = {} }, { call, put }) {
      const res = yield call(getAllPermissions);
      if (res.success) {
        yield put({
          type: 'savePermissions',
          payload: {
            permissions: res.permissions
          }
        })
      }
    }
  },
  
  reducers: {
    saveRoles(state = {}, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
    savePermissions(state = {}, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
  },
};
export default RolesModel;
