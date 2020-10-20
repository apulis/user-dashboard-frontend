import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, message } from 'antd';
import { Form } from '@ant-design/compatible';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva';
import moment from 'moment';
import { Link } from 'umi';
import { FormComponentProps } from 'antd/lib/form';
import { formatMessage } from 'umi-plugin-react/locale';

import { ColumnProps } from 'antd/es/table';

import { ConnectProps, ConnectState } from '@/models/connect';
import { removeGroup } from '@/services/groups'

import { addUsersToGroups } from '@/services/users';
import { getGroupUsers } from '@/services/groups';

import SelectUser from '../../../../components/Relate/SelectUser';
import { IGroupUserInfo } from '../Detail/index';
import styles from './index.less';

export interface IGroup {
  name: string;
  note: string;
  createTime: string;
  id: number;
}

const { Search } = Input;

const List: React.FC<ConnectProps & ConnectState> = ({ dispatch, groups }) => {
  const [selectedRows, setSelectedRows] = useState<IGroup[]>([]);
  const [addGroupModalVisible, setAddGroupModalVisible] = useState<boolean>(false);
  const [currentGroupId, setCurrentGroupId] = useState<number>(0);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [groupUserList, setGroupUserList] = useState<number[]>([]);
  const { list } = groups;
  const fetchUsers = (search?: string, pageNo?: number) => {
    dispatch({
      type: 'groups/fetchGroups',
      payload: {
        search: search ? search : '',
        pageNo,
      }
    })
  }
  const fetchGroupUsers = async (groupId: number) => {
    const res = await getGroupUsers(groupId);
    if (res.success) {
      const data = res.list;
      const groupUserList = data.map((val: IGroupUserInfo) => val.id);
      await setGroupUserList(groupUserList);
    }
  }
  useEffect(() => {
    fetchUsers()
  }, []);
  const removeGroups = (groupName: string[], groupId: number[]) => {
    Modal.confirm({
      title: `${formatMessage({id: 'groups.list.modal.wiil.delete.group'})} ${groupName.join(', ')}`,
      onCancel() {

      },
      async onOk() {
        const res = await removeGroup(groupId);
        if (res.success) {
          message.success(`${formatMessage({id: 'groups.list.modal.success.delete.group'})} ${groupName.join(', ')}`);
          fetchUsers();
        }
      }
    })
  }
  const columns: ColumnProps<IGroup>[] = [
    {
      title: formatMessage({id: 'groups.list.group.name'}),
      render(_text, item) {
        return (
        <Link to={'/admin/group/detail/' + item.id}>{item.name}</Link>
        )
      }
    },
    {
      title: formatMessage({id: 'groups.list.note'}),
      key: 'note',
      dataIndex: 'note',
    },
    {
      title: formatMessage({id: 'groups.list.createTime'}),
      key: 'createTime',
      dataIndex: 'createTime',
      render(_text, item) {
        if (!item.createTime) {
          return (
            <div>-</div>
          )
        }
        return (
          <div>{moment(Number(item.createTime)).format('YYYY-MM-DD')}</div>
        )
      }
    },
    {
      title: formatMessage({id: 'groups.list.actions'}),
      render(_text, item): React.ReactNode {
        return (
          <div>
            <a onClick={() => addUserToCurrentGroups(item.id)} style={{marginRight: '18px', marginLeft: '-20px'}}>
              {formatMessage({id: 'groups.list.add.users'})}
            </a>
            <a onClick={() => removeGroups([item.name], [item.id])} style={{ color: 'red' }}>
              {formatMessage({id: 'groups.list.delete'})}
            </a>
          </div>
        )
      }
    },

  ]
  const onSearch = (s: string) => {
    fetchUsers(s, 1);
  }
  const onRowSelection: (selectedRowKeys: string[] | number[], selectedRows: IGroup[]) => void = (selectedRowKeys, selectedRows) => {
    setSelectedRows(selectedRows);
  }
  const addUserToCurrentGroups = async (currentGroupId?: number) => {
    setGroupUserList([]);
    if (currentGroupId) {
      await fetchGroupUsers(currentGroupId);
    }
    setCurrentGroupId(currentGroupId || 0);
    setAddGroupModalVisible(true);
  }
  const cancelAddGroup = () => {
    setAddGroupModalVisible(false);
    setCurrentGroupId(0);
  }
  const confirmAddGroup = async () => {
    if (selectedUserIds.length === 0) {
      setAddGroupModalVisible(false);
      return;
    }
    let res;
    if (currentGroupId) {
      res = await addUsersToGroups(selectedUserIds, [currentGroupId]);
    } else {
      res = await addUsersToGroups(selectedUserIds, selectedRows.map(r => r.id));
    }
    if (res.success === true) {
      setCurrentGroupId(0);
      message.success(formatMessage({id: 'groups.add.message.success'}))
      setAddGroupModalVisible(false);
    }
  }
  const onSelectUserIds = (userNames: number[]) => {
    setSelectedUserIds(userNames);
  }
  return (
    <PageHeaderWrapper>
      <div className={styles.top}>
        <div className={styles.left}>
          <Link to="/admin/group/add">
            <Button type="primary">
              {formatMessage({id: 'groups.list.add'})}
            </Button>
          </Link>
          <Button onClick={() => addUserToCurrentGroups()} disabled={selectedRows.length === 0} style={{marginLeft: '20px'}}>
            { formatMessage({id: 'groups.list.add.users'}) }
          </Button>
        </div>
        <Search
          placeholder={formatMessage({id: 'groups.list.search.groups'})}
          onSearch={onSearch}
          style={{ width: 200 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={list}
        pagination={{
          onChange: () => {setSelectedRows([])}
        }}
        rowKey={record => String(record.id)}
        rowSelection={{
          type: "checkbox",
          onChange: onRowSelection,
        }} />
        {
          addGroupModalVisible && <Modal
            visible={addGroupModalVisible}
            onCancel={cancelAddGroup}
            onOk={() => confirmAddGroup()}
            width="65%"
          >
            <SelectUser
              onChange={(userIds) => {onSelectUserIds(userIds)}}
              defaultSelected={groupUserList}
            />
          </Modal>
        }
        
    </PageHeaderWrapper>
  )
}


export default connect(({ groups }: ConnectState) => ({ groups }))(Form.create<FormComponentProps>()(List));