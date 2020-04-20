import React, { useState, useEffect } from 'react';
import { Table, Button, Input } from 'antd';
import { Form } from '@ant-design/compatible';
import { PageHeaderWrapper } from '@ant-design/pro-layout';



import { ColumnProps } from 'antd/es/table';
import { connect } from 'dva';
import { ConnectProps, ConnectState } from '@/models/connect';
import { FormComponentProps } from 'antd/lib/form';

import styles from './index.less';
import { Link } from 'umi';

export interface IGroup {
  name: string;
  note: string;
  createTime: string;
}

const { Search } = Input;

const List: React.FC<ConnectProps & ConnectState> = ({ dispatch, groups }) => {
  const [selectedRows, setSelectedRows] = useState<IGroup[]>([])
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
  const addUserFormGroup = () => {
    //
  }
  const removeGroup = () => {
    //
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
    },
    {
      title: 'Actions',
      render(): React.ReactNode {
        return (
          <div>
            <a onClick={addUserFormGroup} style={{marginRight: '18px', marginLeft: '-20px'}}>
              Add Users
            </a>
            <a onClick={removeGroup}>
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
  const addUserToManyGroups = () => {
    //
  }
  return (
    <PageHeaderWrapper>
      <div className={styles.top}>
        <div className={styles.left}>
          <Link to="/admin/group/add">
            <Button type="primary">Add Group</Button>
          </Link>
          <Button onClick={addUserToManyGroups} disabled={selectedRows.length === 0} style={{marginLeft: '20px'}}>Add Users</Button>
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
    </PageHeaderWrapper>
  )
}


export default connect(({ groups }: ConnectState) => ({ groups }))(Form.create<FormComponentProps>()(List));