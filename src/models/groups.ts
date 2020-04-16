import { Reducer } from 'redux';
import { Effect } from 'dva';

import { getGroups } from '@/services/groups';



export interface groupsStateType {
}

export interface GroupsModelType {
  namespace: 'groups';
  state: groupsStateType;
  effects: {
    fetchGroups: Effect;
  };
  reducers: {
    saveGroups: Reducer;
  };
}

const UsersModel: GroupsModelType = {
  namespace: 'groups',
  state: {
    list: [],
    search: ''
  },
  effects: {
    * fetchGroups({ payload }, { call, put }) {
      const res = yield call(getGroups);
      if (res.success) {
        yield put({
          type: 'saveGroups',
          payload: {
            list: res.list,
            search: payload.search,
          },
        })
      }
    }
  },
  
  reducers: {
    saveGroups(state = {}, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
  },
};
export default UsersModel;
