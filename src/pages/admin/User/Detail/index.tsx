import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Form } from '@ant-design/compatible';
import { PageHeader, Table, Input, message, Modal } from 'antd';
import { router } from 'umi';
import { useParams } from 'react-router-dom';
import { FormComponentProps } from 'antd/lib/form';
import { ColumnProps } from 'antd/es/table';
import { getUserById, resetPassword as apiResetPassword, editUserInfo, removeUserRole, getUserRoleInfo, getUserGroups, 
  getUserVc } from '@/services/users';
import { removeGroupUser} from '@/services/groups';
import { ConnectState, ConnectProps } from '@/models/connect';
import { IRoleListItem } from '@/models/roles';
import { IUsers } from '@/models/users';
import { emailReg, mobilePattern, textPattern, userNamePattern } from '@/utils/validates';
import { IGroup } from '../../Groups/List';
import styles from './index.less';

const FormItem = Form.Item;

const UserDetail: React.FC<FormComponentProps & ConnectProps & ConnectState> = ({ form, users, groups, config, user }) => {
  const { id } = useParams();
  const { currentUser } = user;
  const { adminUsers } = config;
  const { getFieldDecorator, validateFields } = form;
  const userId = Number(id);
  const [userInfo, setUserInfo] = useState<IUsers>({userName: '', nickName: '', id: 0});
  const [roleInfo, setRoleInfo] = useState<IRoleListItem[]>([]);
  const [groupInfo, setGroupInfo] = useState<IGroup[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [pageParmas, setPageParmas] = useState({ pageNum: 1, pageSize: 10 });
  const [userVcList, setUserVcList] = useState([]);
  const [vcTotal, setVcTotal] = useState(0);
  const fetchUserById = async () => {
    if (isNaN(userId)) return;
    const res = await getUserById(userId);
    if (res.success) {
      setUserInfo(res.user);
    }
  }
  const fetchUserRoles = async () => {
    if (isNaN(userId)) return;
    const res = await getUserRoleInfo(userId);
    if (res.success) {
      setRoleInfo(res.list)
    }
  }
  const fetchUserGroups = async () => {
    if (isNaN(userId)) return;
    const res = await getUserGroups(userId);
    if (res.success) {
      setGroupInfo(res.list)
    }
  }
  const editCurrentUser = () => {
    setIsEditing(true);
  }
  const saveEditing = () => {
    validateFields(async (err, values) => {
      if (err) return;
      const cancel = message.loading('Submiting');
      for (const key in values) {
        if (!values[key]) {
          values[key] = '';
        }
      }
      const res = await editUserInfo(userId, values);
      cancel();
      if (res.success) {
        message.success('success edit');
        fetchUserById();
      }
      setIsEditing(false);
    })
  }
  const removeRoleForUser = (roleId: number, roleName: string) => {
    Modal.confirm({
      title: `Will delete ${roleName} for current user`,
      async onOk() {
        const res = await removeUserRole(userId, roleId);
        if (res.success) {
          fetchUserById();
          fetchUserRoles();
          message.success(`Success delete ${roleName} `)
        }
      }
    })
  }
  const removeGroupForUser = (groupId: number, groupName: string) => {
    Modal.confirm({
      title: `Will delete ${groupName} for current user`,
      async onOk() {
        const res = await removeGroupUser(groupId, userId);
        if (res.success) {
          fetchUserById();
          fetchUserGroups();
          message.success(`Success delete ${groupName} `)
        }
      }
    })
  }
  const fetchUserVcList = async () => {
    const res = await getUserVc(userId, pageParmas);
    const { success, vcList, total } = res;
    if (success) {
      setUserVcList(vcList);
      setVcTotal(total);
    }
  }

  useEffect(() => {
    if (isNaN(Number(id))) {
      router.push('/admin/user/list')
    }
  }, [id]);

  useEffect(() => {
    fetchUserById();
    fetchUserRoles();
    fetchUserGroups();
  }, [])

  useEffect(() => {
    fetchUserVcList();
  }, [pageParmas])

  const resetPassword = () => {
    setModalVisible(true);
  }

  const confirmEditPassword = () => {
    validateFields(['newPassword'], async (err, result) => {
      if (err) return;
      const { newPassword } = result;
      const res = await apiResetPassword(id, newPassword);
      if (res.success) {
        message.success('Success reset password');
        setModalVisible(false);
      }
    });
  }

  const userInfoColumns: ColumnProps<IUsers>[] = [
    {
      title: 'Nickname',
      render(_text, item) {
        if (isEditing) {
          return (
            <FormItem>
              {
                getFieldDecorator('nickName', {
                  initialValue: item.nickName,
                  rules: [
                    { required: true, message: 'Nickname is required' },
                    { max: 20, message: 'Nickname cannot be longer than 20 characters' },
                    textPattern
                  ]
                })(
                    <Input />
                  )
              }
            </FormItem>
            
          )
        }
        return (
          <div>{item.nickName || '-'}</div>
        )
      }
    },
    {
      title: 'Username',
      render(_text, item) {
        if (isEditing) {
          return (
            <FormItem>
              {
                getFieldDecorator('userName', {
                  initialValue: item.userName,
                  rules: [userNamePattern, { min: 4, message: 'Nickname need at least 4 characters' },
                  { max: 20, message: 'Nickname cannot be longer than 20 characters' }]
                })(
                    <Input disabled />
                  )
                }
            </FormItem>
          )
        }
        return (
          <div>{item.userName}</div>
        )
      }
    },
    {
      title: 'Phone',
      render(_text, item) {
        if (isEditing) {
          return (
            <FormItem>
              {
                getFieldDecorator('phone', {
                  initialValue: item.phone || '',
                  rules: [mobilePattern]
                })(
                    <Input />
                  )
              }
            </FormItem>
            
          )
        }
        return (
          <div>{item.phone || '-'}</div>
        )
      }
    },
    {
      title: 'Email',
      render(_text, item) {
        if (isEditing) {
          return (
            <FormItem>
              {
                getFieldDecorator('email', {
                  initialValue: item.email || '',
                  rules: [
                    { pattern: emailReg, message: 'please check email format' }
                  ]
                })(
                    <Input />
                  )
              } 
            </FormItem>
            
          )
        }
        return (
          <div>{item.email || '-'}</div>
        )
      }
    },
    {
      title: 'Description',
      render(_text, item) {
        if (isEditing) {
          return (
            <FormItem>
              {getFieldDecorator('note', {
                  initialValue: item.note || '',
                  rules: [textPattern]
                })(<Input />)}
            </FormItem>
            
          )
        }
        return (
          <div>{item.note || '-'}</div>
        )
      }
    },
    {
      title: 'Action',
      align: 'center',
      render() {
        if (adminUsers.includes(userInfo.userName)) {
          return <div>-</div>;
        }
        if (isEditing) {
          return (
            <>
              <a onClick={saveEditing} style={{ marginRight: 10 }}>SAVE</a>
              <a onClick={() => setIsEditing(false)}>CANCEL</a>
            </>
          )
        }
        const currentRole = currentUser?.currentRole;
        return (
          <div>
            <a style={{marginRight: '15px'}} onClick={editCurrentUser}>Edit</a>
            {
              currentRole.includes('System Admin') && 
              <a onClick={resetPassword}>Reset password</a>
            }
          </div>
        )
      }
    }
  ]
  
  const userRoleColumns: ColumnProps<IRoleListItem>[] = [
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
      title: 'Role Type',
      render(_text, item) {
        return (
        <div>{item.isPreset ? 'Preset Role' : 'Custom Role'}</div>
        )
      }
    },
    {
      title: 'Action',
      render(_text, item) {
        if (adminUsers.includes(userInfo.userName)) {
          return <div>-</div>;
        }
        return (
          <a onClick={() => removeRoleForUser(item.id, item.name)}>Remove</a>
        )
      }
    },
  ]
  
  const userGroupColumns: ColumnProps<IGroup>[] = [
    {
      title: 'Group Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'note',
      key: 'note',
    },
    {
      title: 'Action',
      render(_text, item) {
        return (
          <a onClick={() => removeGroupForUser(item.id, item.name)}>Remove</a>
        )
      }
    }
  ]

  const vcListColumns = [
    {
      title: 'VCName',
      dataIndex: 'vcName',
    },
    {
      title: 'DeviceType',
      dataIndex: 'quota',
      render: (i: string) => getDeviceTypeContent(i)
    },
    {
      title: 'DeviceNumber',
      dataIndex: 'quota',
      render: (i: string) => getDeviceTypeContent(i, true)
    },
    {
      title: 'MaxAvailable',
      dataIndex: 'metadata',
      render: (i: string) => getDeviceTypeContent(i, true, true)
    }
  ]

  const getDeviceTypeContent = (v: string, isNum?: boolean, isMetadata?: boolean) => {
    const val = JSON.parse(v);
    const keys = Object.keys(val);
    let content = null;
    if (keys.length) {
      isNum ? content = keys.map(i => <p>{isMetadata ? val[i].user_quota : val[i]}</p>)  : content = keys.map(i => <p>{i}</p>)
    }
    return content;
  }

  const pageParmasChange = (page: any, count: any) => {
    setPageParmas({ pageNum: page, pageSize: count });
  };

  return (
    <div className={styles.detailWrap}>
      <PageHeader
        className="site-page-header"
        onBack={() => router.push('/admin/user/list')}
        title="User Detail"
        subTitle=""
      />

      <Table
        columns={userInfoColumns}
        title={() => (<h1>User Info</h1>)}
        dataSource={[userInfo]}
        pagination={false}
      />

      <Table
        columns={vcListColumns}
        title={() => <h1>User VC Resources</h1>}
        dataSource={userVcList}
        pagination={{
          total: vcTotal,
          onChange: pageParmasChange,
          current: pageParmas.pageNum,
          pageSize: pageParmas.pageSize
        }}
      />

      <Table
        columns={userRoleColumns}
        title={() => <h1>User Roles</h1>}
        dataSource={roleInfo}
      />

      <Table
        columns={userGroupColumns}
        title={() => <h1>User Groups</h1>}
        dataSource={groupInfo}
      />

      {
        modalVisible && <Modal
          visible={modalVisible}
          onCancel={() => {setModalVisible(false)}}
          onOk={confirmEditPassword}
        
        >
          <FormItem label="New password">
            {
              getFieldDecorator('newPassword', {
                rules: [
                  {
                    required: true,
                    message: 'New password is required',
                  },
                  {
                    min: 6,
                    message: 'New password must be at least 6 characters',
                  },
                  {
                    max: 20,
                    message: 'New password cannot be longer than 20 characters',
                  }
                ]
              })(
                <Input />
              )
            }
          </FormItem>

        </Modal>
      }

    </div>
  )
}



export default connect(({ users, groups, roles, config, user }: ConnectState) => ({ users, groups, roles, config, user }))(Form.create<FormComponentProps & ConnectProps>()(UserDetail))