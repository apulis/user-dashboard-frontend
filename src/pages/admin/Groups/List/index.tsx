import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, message } from 'antd';
import { Form } from '@ant-design/compatible';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva';
import moment from 'moment';
import { Link } from 'umi';
import { FormComponentProps } from 'antd/lib/form';

import { ColumnProps } from 'antd/es/table';

import { ConnectProps, ConnectState } from '@/models/connect';
import { removeGroup } from '@/services/groups'

import { addUsersToGroups } from '@/services/users';

import SelectUser from '../../../../components/Relate/SelectUser';
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
  const [currentGroupName, setCurrentGroupName] = useState<string>('');
  const [selectedUserNames, setSelectedUserNames] = useState<string[]>([]);
  const { list } = groups;
  const fetchUsers = (search?: string) => {
    dispatch({
      type: 'groups/fetchGroups',
      payload: {
        search: search ? search : ''
      }
    })
  }
  useEffect(() => {
    fetchUsers()
  }, []);
  const removeGroups = (groupName: string[], groupId: number[]) => {
    Modal.confirm({
      title: `Will delete group: ${groupName.join(', ')}`,
      onCancel() {

      },
      async onOk() {
        const res = await removeGroup(groupId);
        if (res.success) {
          message.success(`Success delete group: ${groupName.join(', ')}`);
          fetchUsers();
        }
      }
    })
  }
  const columns: ColumnProps<IGroup>[] = [
    {
      title: 'Group Name',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: 'Note',
      key: 'note',
      dataIndex: 'note',
    },
    {
      title: 'Create Time',
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
      title: 'Actions',
      render(_text, item): React.ReactNode {
        return (
          <div>
            <a onClick={() => addUserToCurrentGroups(item.name)} style={{marginRight: '18px', marginLeft: '-20px'}}>
              Add Users
            </a>
            <a onClick={() => removeGroups([item.name], [item.id])}>
              Delete
            </a>
          </div>
        )
      }
    },

  ]
  const onSearch = (s: string) => {
    fetchUsers(s)
  }
  const onRowSelection: (selectedRowKeys: string[] | number[], selectedRows: IGroup[]) => void = (selectedRowKeys, selectedRows) => {
    setSelectedRows(selectedRows);
  }
  const addUserToCurrentGroups = (currentGroupName?: string) => {
    setCurrentGroupName(currentGroupName || '');
    setAddGroupModalVisible(true);
  }
  const cancelAddGroup = () => {
    setAddGroupModalVisible(false);
    setCurrentGroupName('');
  }
  const confirmAddGroup = async () => {
    let res;
    if (currentGroupName) {
      res = await addUsersToGroups(selectedUserNames, [currentGroupName]);
    } else {
      res = await addUsersToGroups(selectedUserNames, selectedRows.map(r => r.name));
    }
    if (res.success === true) {
      setCurrentGroupName('');
      message.success('Success!')
      setAddGroupModalVisible(false);
    } else {
      if (res.duplicate && res.duplicate.length > 0) {
        res.duplicate.forEach((dpc: any) => {
          message.error(`user ${dpc.userName} is already in group ${dpc.groupName}, please cancel selected`);
        })
      }
    }
  }
  const onSelectUserNames = (userNames: string[]) => {
    setSelectedUserNames(userNames);
  }
  return (
    <PageHeaderWrapper>
      <div className={styles.top}>
        <div className={styles.left}>
          <Link to="/admin/group/add">
            <Button type="primary">Add Group</Button>
          </Link>
          <Button onClick={() => addUserToCurrentGroups()} disabled={selectedRows.length === 0} style={{marginLeft: '20px'}}>Add Users</Button>
        </div>
        <Search
          placeholder="input search text"
          onSearch={onSearch}
          style={{ width: 200 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={list}
        rowSelection={{
          type: "checkbox",
          onChange: onRowSelection,
        }} />
        <Modal
          visible={addGroupModalVisible}
          onCancel={cancelAddGroup}
          onOk={() => confirmAddGroup()}
          width="65%"
        >
          <SelectUser
            onChange={(userNames) => {onSelectUserNames(userNames)}}
          />
        </Modal>
    </PageHeaderWrapper>
  )
}


export default connect(({ groups }: ConnectState) => ({ groups }))(Form.create<FormComponentProps>()(List));