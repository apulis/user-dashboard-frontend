import { Reducer } from 'redux';
import { Effect } from 'dva';

import { getUsers } from '@/services/roles';

export interface IRoleListItem {
  name: string;
  note: string;
  isPreset: number;
}


export interface RolesStateType {
  list: IRoleListItem[];
  search: string;
  total: number;
}

export interface RolesModelType {
  namespace: 'roles';
  state: RolesStateType;
  effects: {
    fetchRoles: Effect;
  };
  reducers: {
    saveRoles: Reducer;
  };
}

const RolesModel: RolesModelType = {
  namespace: 'roles',
  state: {
    list: [],
    search: '',
    total: 0,
  },
  effects: {
    * fetchRoles({ payload }, { call, put }) {
      const res = yield call(getUsers, payload);
      if (res.success) {
        console.log(res)
        yield put({
          type: 'saveRoles',
          payload: {
            list: res.list,
            total: res.total
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
  },
};
export default RolesModel;
