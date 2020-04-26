import { Reducer } from 'redux';
import { Effect } from 'dva';

import { getGroups, getGroupTotalCount } from '@/services/groups';

interface IGroupListItem {
  name: string;
  note: string;
  createTime: string;
}


export interface groupsStateType {
  list: IGroupListItem[];
  search: string;
  total: number;
}

export interface GroupsModelType {
  namespace: 'groups';
  state: groupsStateType;
  effects: {
    fetchGroups: Effect;
    getGroupTotalCount: Effect
  };
  reducers: {
    saveGroups: Reducer;
  };
}

const GroupsModel: GroupsModelType = {
  namespace: 'groups',
  state: {
    list: [],
    search: '',
    total: 0,
  },
  effects: {
    * fetchGroups({ payload = {} }, { call, put }) {
      const res = yield call(getGroups, payload);
      if (res.success) {
        yield put({
          type: 'saveGroups',
          payload: {
            list: res.list,
            search: payload.search,
          },
        })
      }
    },
    * getGroupTotalCount({ payload = {} }, { call, put }) {
      const res = yield call(getGroupTotalCount);
      if (res.success) {
        yield put({
          type: 'saveGroups',
          payload: {
            total: res.count
          }
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
export default GroupsModel;
