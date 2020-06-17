import React, { useEffect, useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva';
import { Link } from 'umi';
import { Table, Button, Pagination, Select, Dropdown, Menu, Modal, message, Input } from 'antd';
import { Form } from '@ant-design/compatible';
import { FormComponentProps } from '@ant-design/compatible/lib/form';
import { DownOutlined, UsergroupAddOutlined, UserDeleteOutlined, ExclamationCircleOutlined  } from '@ant-design/icons';
import { ColumnProps } from 'antd/es/table';
import { ClickParam } from 'antd/lib/menu';

import { ConnectProps, ConnectState } from '@/models/connect';
import { IUsers } from '@/models/users';

import SelectRole from '@/components/Relate/SelectRole'

import { removeUsers, addUsersToGroups, getUserRolesById, getUserGroups } from '@/services/users';
import { addRoleToUsers, editRoleToUsers } from '@/services/roles';
import SelectGroup from '../../../../components/Relate/SelectGroup';

import styles from './index.less'

interface IFetchUserParam {
  pageNo: number;
  pageSize?: number;
  search?: string;
}

const { Option } = Select;
const { confirm } = Modal;
const { Search } = Input;

const List: React.FC<FormComponentProps & ConnectProps & ConnectState> = (props) => {
  const { dispatch, users, form, groups, config, user } = props;
  const { adminUsers } = config;
  const { currentUser } = user;
  const { list, pageNo, pageSize, total } = users || {};
  const { list: groupList } = groups;
  if (list.length > 50) {
    list.splice(50, list.length);
  }
  const [selectRows, setSelectRows] = useState<IUsers[]>([]);
  const [addRoleForUserModalVisible, setAddRoleForUserModalVisible] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<number[]>([]);
  const [addGroupModalVisible, setAddGroupModalVisible] = useState<boolean>(false);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [selectRowKeys, setSelectRowKeys] = useState<string[] | number[]>([]);
  const [currentHandleUserId, setCurrentHandleUserId] = useState<number>(0);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [currentUserRoles, setCurrentUserRoles] = useState<number[]>([]);
  const [userGroupId, setUserGroupId] = useState<number[]>([]);
  const currentRole = currentUser?.currentRole;
  const fetchUsers = async (params: IFetchUserParam) => {
    setTableLoading(true);
    await dispatch({
      type: 'users/fetchUsers',
      payload: {
        pageNo: params.pageNo,
        pageSize: params.pageSize,
        search: params.search || search,
      }
    })
    setTableLoading(false);
  }
  useEffect(() => {
    fetchUsers({pageNo: 1, pageSize: 10});
    fetchGroups();
  }, [])
  const fetchUserGroups = async (userId: number) => {
    const res = await getUserGroups(userId);
    if (res.success) {
      await setUserGroupId(res.list.map((val: any) => val.id));
    }
  }
  const starRemoveUsers = (currentHandleUserId?: number) => {
    let userIds: number[];
    if (currentHandleUserId) {
      userIds = [currentHandleUserId];
    } else {
      userIds = selectRows.map((val: IUsers) => val.id);
    }
    removeUsers(userIds)
      .then(res => {
        let tag = false;
        if (list.length === userIds.length) {
          // 最后一页的数据全部删除的情况
          tag = true;
        }
        if (res.success) {
          message.success('Success Delete')
          let page = tag ? pageNo - 1 : pageNo;
          if (page <= 0) page = 1;
          fetchUsers({
            pageSize,
            pageNo: page,
          })
          clearRowSelection();
          setCurrentHandleUserId(0);
        } else if (res.success === false) {
          message.warn(res.message);
        }
      })
  }
  const addRolesForUser = (userId: number) => {
    setCurrentHandleUserId(userId);
    const cancel = message.loading('loading...');
    getUserRolesById(userId)
      .then(res => {
        if (res.success) {
          cancel();
          const currentUserRoles = res.list.map(r => r.roleId);
          setCurrentUserRoles(currentUserRoles);
          setAddRoleForUserModalVisible(true);
        }
      })
      .catch(error => {
        cancel();
        message.error('loading roles error');
      })
  }
  const columns: ColumnProps<IUsers>[] = [
    {
      title: 'Username',
      dataIndex: 'userName',
      render(_text, item) {
        return (
          <Link to={"/admin/user/detail/" + item.id}>{item.userName}</Link>
        )
      }
    },
    {
      title: 'Nickname',
      dataIndex: 'nickName',
      render(_text, item) {
        return (
          <Link to={"/admin/user/detail/" + item.id}>{item.nickName}</Link>
        )
      }
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render(text) {
        return (
          text ? text : '-'
        )
      }
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render(text) {
        return (
          text ? text : '-'
        )
      }
    },
    {
      title: 'Action',
      width: '250px',
      align: 'center',
      render(_text, item): React.ReactNode {
        return (
          <div style={{display: 'flex', justifyContent: 'space-around'}}>
            <Dropdown
              overlay={
              <Menu>
                {!adminUsers.includes(item.userName) && <Menu.Item onClick={() => addRolesForUser(item.id)} key="0">Edit Role</Menu.Item>}
                <Menu.Item onClick={async () => {await addToGroup(item.id);setCurrentHandleUserId(item.id)}} key="1">Add To User Group</Menu.Item>
                {!adminUsers.includes(item.userName) && <Menu.Item onClick={() => {setCurrentHandleUserId(item.id);removeUser(item.id)}} key="2">Delete</Menu.Item>}
              </Menu>}
            >
            <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                More <DownOutlined />
              </a>
            </Dropdown>
          </div>
        )
      }
    },
  ];
  
  const onPageNationChange: (page: number, pageSize?: number) => void = (pageNo, pageSize) => {
    fetchUsers({ pageSize, pageNo });
    setSelectRows([]);
    setSelectRowKeys([]);
  }
  const onPageSizeChange = (pageSize: number) => {
    dispatch({
      type: 'users/changePageSize',
      payload: {
        pageSize,
      }
    })
    fetchUsers({
      pageNo: 1,
      pageSize,
    })
  }
  const clearRowSelection = () => {
    setSelectRowKeys([]);
  }
  const onRowSelection: (selectedRowKeys: string[] | number[], selectedRows: IUsers[]) => void = (selectedRowKeys, selectedRows) => {
    setSelectRowKeys(selectedRowKeys);
    setSelectRows(selectedRows);
  }
  const handleMenuClick: ((param: ClickParam) => void) = (e) => {
    //
  }
  const fetchGroups = (search?: string) => {
    dispatch({
      type: 'groups/fetchGroups',
      payload: {
        search: search || '',
      }
    })
  }
  const addToGroup = async (userId?: number) => {
    if (userId) {
      await fetchUserGroups(userId);
    }
    setAddGroupModalVisible(true);
  }
  const removeUser = (userId?: number) => {
    
    confirm({
      title: 'Are you sure you want to delete selected item(s)?',
      icon: <ExclamationCircleOutlined />,
      content: 'Selected users will be disabled',
      okText: 'OK',
      cancelText: 'CANCEL',
      onOk() {
        starRemoveUsers(userId);
      },
      onCancel() {
        setCurrentHandleUserId(0);
      },
    })

  }
  const onSearch = (s: string) => {
    setSearch(s);
    fetchUsers({
      pageNo: 1,
      pageSize,
      search: s,
    })
  }
  const onSelectedGroupChange = (selectedGroupId: number[]) => {
    setSelectedGroupId(selectedGroupId);
  }
  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1" onClick={() => addToGroup()}>
        <UsergroupAddOutlined />
        Add To Group
      </Menu.Item>
      <Menu.Item key="2" disabled={!!selectRows.find(val => adminUsers.includes(val.userName))} onClick={() => removeUser()}>
        <UserDeleteOutlined />
        Delete Current User
      </Menu.Item>
    </Menu>
  )
  const onConfirmAddGroup = async () => {
    let selectedUserIds: number[];
    if (currentHandleUserId) {
      selectedUserIds = [currentHandleUserId]
    } else {
      selectedUserIds = selectRows.map(val => val.id);
    }
    const cancel = message.loading('Submitting');
    const res = await addUsersToGroups(selectedUserIds, selectedGroupId);
    cancel();
    if (res.success === true) {
      message.success('Success!')
      setAddGroupModalVisible(false);
    }
  };
  const confirmAddRoleToUser = async () => {
    const res = await editRoleToUsers(currentHandleUserId, selectedRoleIds);
    if (res.success) {
      message.success('Success edit role');
      setCurrentHandleUserId(0);
      setCurrentUserRoles([]);
      setAddRoleForUserModalVisible(false);
    }
  }
  return (
    <PageHeaderWrapper>
      <div className={styles.top}>
        <div className={styles.left}>
          <Link to="/admin/user/add">
            <Button type="primary">Create User</Button>
          </Link>
          <Button type="primary" disabled={selectRows.length === 0} onClick={() => addToGroup()} style={{ margin: '0 20px' }}>Add To Group</Button>
          <Button disabled={!!selectRows.find(val => adminUsers.includes(val.userName)) || selectRowKeys.length === 0} onClick={() => removeUser()}>Delete Current User</Button>
          {/* <Dropdown disabled={selectRows.length === 0} overlay={menu}>
            <Button style={{marginLeft: '15px'}}>
              Actions <DownOutlined />
            </Button>
          </Dropdown> */}
        </div>
        
        <Search
          placeholder="search users"
          onSearch={onSearch}
          style={{ width: 200 }}
        />
      </div>
      
      <Table
        style={{marginTop: '20px'}}
        rowSelection={{
          type: "checkbox",
          onChange: onRowSelection,
          selectedRowKeys: selectRowKeys
        }}
        dataSource={list}
        columns={columns}
        pagination={false}
        loading={tableLoading}
      />
      <div className={styles.bottom}>
        <div style={{ height: '24px', marginRight: '10px' }}>Items per page:</div>
        <Select
          style={{ width: 100, marginRight: '20px' }}
          onChange={onPageSizeChange}
          defaultValue={10}
        >
          <Option value={10}>10</Option>
          <Option value={20}>20</Option>
          <Option value={50}>50</Option>
        </Select>
        <Pagination
          style={{marginTop: '20px'}}
          onChange={onPageNationChange}
          defaultCurrent={1}
          pageSize={pageSize}
          total={total}
        />
      </div>
      <Modal
        visible={addGroupModalVisible}
        onCancel={() => setAddGroupModalVisible(false)}
        onOk={onConfirmAddGroup}
        title="Add to group"
        width="65%"
      >
        {
          addGroupModalVisible && <SelectGroup
            groupList={groupList}
            defaultSelected={userGroupId}
            onChange={(selectedGroupId) => onSelectedGroupChange(selectedGroupId)}
          />
        }
        
      </Modal>

      <Modal
        visible={addRoleForUserModalVisible}
        onOk={confirmAddRoleToUser}
        onCancel={() => {setAddRoleForUserModalVisible(false);setCurrentHandleUserId(0)}}
      >
        {
          addRoleForUserModalVisible && <SelectRole
            currentUserId={currentHandleUserId}
            onChange={(selectedRoleIds) => setSelectedRoleIds(selectedRoleIds)}
            currentUserRoles={currentUserRoles}
          />
        }

      </Modal>
      
    </PageHeaderWrapper>
  )
};

export default connect(({ users, groups, config, user }: ConnectState) => ({ users, groups, config, user }))(Form.create<FormComponentProps & ConnectProps>()(List));
