import React, { useEffect, useState } from 'react';
import { Button, Table, Input, Pagination, message, Modal } from 'antd';
import { Form } from '@ant-design/compatible';
import { connect } from 'dva';
import { PageHeaderWrapper } from '@ant-design/pro-layout';

import { ConnectState, ConnectProps } from '@/models/connect';
import { FormComponentProps } from '@ant-design/compatible/es/form';

import styles from './index.less';
import { Link } from 'umi';
import { ColumnProps } from 'antd/es/table';

import SelectGroup from '@/components/Relate/SelectGroup';
import SelectUser from "@/components/Relate/SelectUser";

import { addRoleToGroups, addRoleToUsers } from '@/services/roles';

import { removeRoles } from '@/services/roles';
import { IRoleListItem } from '@/models/roles';



const { Search } = Input;

const List: React.FC<ConnectProps & ConnectState> = ({ dispatch, roles, groups }) => {
  const [selectRowKeys, setSelectRowKeys] = useState<string[] | number[]>([]);
  const [selectRows, setSelectRows] = useState<IRoleListItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [pageNo, setPageNo] = useState<number>(1);
  const [currentHandleRoleId, setCurrentHandleRoleId] = useState<number>(0);
  const [addGroupModalVisible, setAddGroupModalVisible] = useState<boolean>(false);
  const [addUserModalVisible, setAddUserModalVisible] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number[]>([]);
  const addRoleToUser = (roleName: number) => {
    setCurrentHandleRoleId(roleName);
    setAddUserModalVisible(true);
  }
  const addRoleToGroup = (roleName: number) => {
    setCurrentHandleRoleId(roleName);
    setAddGroupModalVisible(true);
  }
  const { list: groupList } = groups;
  console.log('groupList', groupList)
  const columns: ColumnProps<IRoleListItem>[] = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',   
    },
    {
      title: 'Description',
      dataIndex: 'note',
      key: 'note',   
    },
    {
      title: 'Type',
      dataIndex: 'type',
      align: 'center',
      render(_text, item) {
        return (
          <div>{item.isPreset ? 'Preset Role' : 'Custom Role'}</div>
        )
      } 
    },
    {
      title: 'Action',
      align: 'center',
      width: '320px',
      render(_text, item) {
        return (
          <div style={{display: 'flex', justifyContent: 'space-around'}}>
            <a onClick={() => addRoleToUser(item.id)}>Related To User</a>
            <a onClick={() => addRoleToGroup(item.id)}>Related To Group</a>
            {item.isPreset === 0 && <a onClick={() => removeCurrentSelectedRole(item.id)}>Delete</a>}
          </div>
        )
      }
    },
  ]
  const { list, total } = roles;
  const cancelRelate = () => {
    setCurrentHandleRoleId(0);
    setAddUserModalVisible(false);
    setAddGroupModalVisible(false);
    setSelectedGroupId([]);
    setSelectedUserId([]);
  }
  const removeCurrentSelectedRole = async (currentRole?: number) => {
    Modal.confirm({
      title: 'Will delete current selected role?',
      async onOk() {
        let res;
        if (typeof currentRole === 'number') {
          res = await removeRoles([currentRole])
        } else {
          const currentRemoveUserRoleNames = selectRows.map(r => r.id);
          res = await removeRoles(currentRemoveUserRoleNames)
        }
        if (res.success === true) {
          message.success(`Success`);
          fetchUsers()
        }
      }
    })
    
  }
  const fetchUsers = (s?: string, page?: number) => {
    dispatch({
      type: 'roles/fetchRoles',
      payload: {
        pageNo: page || pageNo,
        pageSize: 10,
        search: typeof s !== 'undefined' ? s : search
      }
    })
  }
  const onPageNationChange = (pageNo: number) => {
    setPageNo(pageNo);
    fetchUsers(search, pageNo);
    setSelectRows([]);
    setSelectRowKeys([]);
  }
  const onRowSelection: (selectedRowKeys: string[] | number[], selectedRows: IRoleListItem[]) => void = (selectedRowKeys, selectedRows) => {
    setSelectRowKeys(selectedRowKeys)
    setSelectRows(selectedRows);
  }
  const onSearchRoles = (search: string) => {
    setSearch(search);
    fetchUsers(search);
  }
  const confirmRelateGroup = async () => {
    const res = await addRoleToGroups([currentHandleRoleId], selectedGroupId);
    if (res.success === true) {
      message.success('Success');
      setAddGroupModalVisible(false);
    }
  }
  const confirmRelateUser = async () => {
    const res = await addRoleToUsers(selectedUserId, [currentHandleRoleId]);
    if (res.success === true) {
      message.success('Success');
      setAddUserModalVisible(false);
    }
  }
  useEffect(() => {
    fetchUsers();
    dispatch({
      type: 'groups/fetchGroups'
    })
  }, [])
  console.log('selectRows', selectRows)
  const buttonDisabled = !!(selectRows.find(val => val.isPreset === 1) || selectRows.length === 0);
  return (
    <PageHeaderWrapper>
      <div className={styles.top}>
        <div className={styles.left}>
          <Link to="/admin/role/add">
            <Button style={{marginRight: '20px'}} type="primary">Add Role</Button>
          </Link>
          <Button onClick={() => removeCurrentSelectedRole()} disabled={buttonDisabled}>Delete Current Role</Button>
        </div>
        <Search onSearch={onSearchRoles} style={{width: '200px' }}/>
      </div>
      <Table
        style={{marginTop: '20px'}}
        rowSelection={{
          type: "checkbox",
          onChange: onRowSelection,
          selectedRowKeys: selectRowKeys
        }}
        columns={columns}
        dataSource={list}
        pagination={false}
      />
      <Pagination
        style={{marginTop: '20px'}}
        onChange={onPageNationChange}
        // pageSize={pageSize}
        total={total}
      />
      {
        addGroupModalVisible && <Modal
        visible={addGroupModalVisible}
        onCancel={cancelRelate}
        onOk={confirmRelateGroup}
      >
        <SelectGroup
          groupList={groupList}
          onChange={(selectedGroupId) => setSelectedGroupId(selectedGroupId)}
        />
      </Modal>
      }
      {
        addUserModalVisible && <Modal
        visible={addUserModalVisible}
        onCancel={cancelRelate}
        onOk={confirmRelateUser}
      >
        <SelectUser
          onChange={(selectedUserId) => setSelectedUserId(selectedUserId)}
        />
      </Modal> 
      }
      
    </PageHeaderWrapper>
  )
}


export default connect(({ roles, groups }: ConnectState) => ({ roles, groups }))(Form.create<FormComponentProps>()(List));