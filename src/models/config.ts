import { Reducer } from 'redux';
import { Effect } from 'dva';

import { getOAuth2Methods, getAdminUsers } from '@/services/config';

export interface ConfigStateType {
  authMethods: string[];
  adminUsers: string[];
}

export interface ConfigModelType {
  namespace: 'config';
  state: ConfigStateType;
  effects: {
    fetchAuthMethods: Effect;
    fetchAdminUsers: Effect;
  };
  reducers: {
    save: Reducer;
  };
}

const ConfigModel: ConfigModelType = {
  namespace: 'config',
  state: {
    authMethods: [],
    adminUsers: [],
  },
  effects: {
    * fetchAuthMethods({ payload }, { call, put }) {
      const res = yield call(getOAuth2Methods);
      if (res.success) {
        yield put({
          type: 'save',
          payload: {
            authMethods: res.methods
          }
        })
      }
    },
    * fetchAdminUsers({ payload }, { call, put }) {
      const res = yield call(getAdminUsers);
      if (res.success) {
        yield put({
          type: 'save',
          payload: {
            adminUsers: res.list,
          }
        })
      }
    }
  },
  
  reducers: {
    save(state = {}, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
  },
};
export default ConfigModel;
