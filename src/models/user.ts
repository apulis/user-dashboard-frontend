import { Effect } from 'dva';
import { Reducer } from 'redux';
import { setAuthority } from '@/utils/authority';

import { queryCurrent } from '@/services/user';

export interface CurrentUser {
  userName?: string;
  group?: string;
  nickName?: string;
  currentAuthority?: string[];
  openId?: string;
  id: number;
  microsoftId?: string;
  wechatId?: string;
  phone?: string;
  email?: string;
}

export interface UserModelState {
  currentUser?: CurrentUser;
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetchCurrent: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
  };
}

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    currentUser: undefined,
  },
  effects: {
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      if (response.success) {
        yield put({
          type: 'saveCurrentUser',
          payload: response,
        });
      }
      if (response.permissionList) {
        setAuthority(response.permissionList);
      }
    },
  },

  reducers: {
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
  },
};

export default UserModel;
