import React, { useEffect, useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva';
import { Link } from 'umi';
import { Table, Button, Pagination, Select, Dropdown, Menu, Modal, message, Input } from 'antd';
import { Form } from '@ant-design/compatible';
import { FormComponentProps } from '@ant-design/compatible/lib/form';
import { DownOutlined, UsergroupAddOutlined, UserDeleteOutlined, ExclamationCircleOutlined  } from '@ant-design/icons';

import { ConnectProps, ConnectState } from '@/models/connect';
import { ColumnProps } from 'antd/es/table';
import UsersModel, { IUsers } from '@/models/users';

import { removeUsers } from '@/services/users';

import styles from './index.less'
import { ClickParam } from 'antd/lib/menu';

interface IFetchUserParam {
  pageNo: number;
  pageSize?: number;
  search?: string;
}

const { Option } = Select;
const { confirm } = Modal;
const { Search } = Input;

const List: React.FC<FormComponentProps & ConnectProps & ConnectState> = (props) => {
  const { dispatch, users: { list, pageNo, pageSize, total } } = props;
  const [selectRows, setSelectRows] = useState<IUsers[]>([]);
  const [addGroupModalVisible, setAddGroupModalVisible] = useState<boolean>(false);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [selectRowKeys, setSelectRowKeys] = useState<string[] | number[]>([]);
  const fetchUsers = async (params: IFetchUserParam) => {
    setTableLoading(true);
    await dispatch({
      type: 'users/fetchUsers',
      payload: {
        pageNo: params.pageNo,
        pageSize: params.pageSize,
        search: params.search,
      }
    })
    setTableLoading(false);
  }
  useEffect(() => {
    fetchUsers({pageNo, pageSize});
  }, [])
  const columns: ColumnProps<IUsers>[] = [
    {
      title: 'UserName',
      dataIndex: 'userName',
      key: 'userName',    
    },
    {
      title: 'NickName',
      dataIndex: 'nickName',
      key: 'nickName',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Action',
      render(): React.ReactNode {
        return (
          <span>123</span>
        )
      }
    },
  ];
  
  const onPageNationChange: (page: number, pageSize?: number) => void = (pageNo, pageSize) => {
    fetchUsers({pageSize, pageNo})
  }
  const onPageSizeChange = (pageSize: number) => {
    dispatch({
      type: 'users/changePageSize',
      payload: {
        pageSize,
      }
    })
    fetchUsers({
      pageNo,
      pageSize,
    })
  }
  const onRowSelection: (selectedRowKeys: string[] | number[], selectedRows: IUsers[]) => void = (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    setSelectRowKeys(selectedRowKeys)
    setSelectRows(selectedRows);
  }
  const handleMenuClick: ((param: ClickParam) => void) = (e) => {
    //
  }
  const addToGroup = () => {
    setAddGroupModalVisible(true);
    console.log(123, addGroupModalVisible)
    dispatch({
      type: 'groups/fetchGroups',
      payload: {
        search: '',
      }
    })
  }
  const removeUser = () => {
    
    confirm({
      title: 'Do you Want to delete these items?',
      icon: <ExclamationCircleOutlined />,
      content: 'Then these users will not be allowed to platform',
      okText: 'OK',
      cancelText: 'CANCEL',
      onOk() {
        const userNames = selectRows.map((val: IUsers) => val.userName);
        removeUsers(userNames)
          .then(res => {
            if (res.success) {
              message.success('Success Delete User: ' + userNames.join(', '))
              fetchUsers({
                pageSize,
                pageNo,
              })
              setSelectRowKeys([])
            }
          })
      },
      onCancel() {
        //
      },
    })

  }
  const onSearch = (s: string) => {
    fetchUsers({
      pageNo,
      pageSize,
      search: s,
    })
  }
  
  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1" onClick={addToGroup}>
        <UsergroupAddOutlined />
        Add To Group
      </Menu.Item>
      <Menu.Item key="2" onClick={removeUser}>
        <UserDeleteOutlined />
        Delete Current User
      </Menu.Item>
    </Menu>
  )
  return (
    <PageHeaderWrapper>
      <div className={styles.top}>
        <div className={styles.left}>
          <Link to="/admin/user/add">
            <Button type="primary">Add User</Button>
          </Link>
          <Dropdown disabled={selectRows.length === 0} overlay={menu}>
            <Button style={{marginLeft: '15px'}}>
              Actions <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        
        <Search
          placeholder="input search text"
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
        <div style={{ height: '24px', marginRight: '10px' }}>Count per page:</div>
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
          pageSize={pageSize}
          total={total}
        />
      </div>
      <Modal
        visible={addGroupModalVisible}
        onCancel={() => setAddGroupModalVisible(false)}
        title="Add to group"
      >
        
      </Modal>
      
    </PageHeaderWrapper>
  )
};

export default connect(({ users, groups }: ConnectState) => ({ users, groups }))(Form.create<FormComponentProps & ConnectProps>()(List));
