import { Reducer } from 'redux';
import { Effect } from 'dva';

import { getOAuth2Methods } from '@/services/config';

export interface ConfigStateType {
  authMethods: string[];
}

export interface ConfigModelType {
  namespace: 'config';
  state: ConfigStateType;
  effects: {
    fetchAuthMethods: Effect
  };
  reducers: {
    save: Reducer;
  };
}

const ConfigModel: ConfigModelType = {
  namespace: 'config',
  state: {
    authMethods: []
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
