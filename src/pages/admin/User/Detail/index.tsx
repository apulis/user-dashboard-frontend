import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Form } from '@ant-design/compatible';
import { PageHeader, Table, Input, message, Modal } from 'antd';
import { router } from 'umi';
import { useParams } from 'react-router-dom';


import { FormComponentProps } from 'antd/lib/form';
import { ColumnProps } from 'antd/es/table';

import { getUserById, getUserRolesById, editUserInfo, removeUserRole, getUserRoleInfo, getUserGroups } from '@/services/users';
import { removeGroupUser} from '@/services/groups';

 
import { ConnectState, ConnectProps } from '@/models/connect';
import { IRoleListItem } from '@/models/roles';
import { IUsers } from '@/models/users';

import { emailReg } from '@/utils/validates';
import { IGroup } from '../../Groups/List';


const FormItem = Form.Item;



const UserDetail: React.FC<FormComponentProps & ConnectProps & ConnectState> = ({ form, users, groups }) => {
  const { id } = useParams();
  const { getFieldDecorator, validateFields } = form;
  const userId = Number(id);
  const [userInfo, setUserInfo] = useState<IUsers>({userName: '', nickName: '', id: 0});
  const [roleInfo, setRoleInfo] = useState<IRoleListItem[]>([]);
  const [groupInfo, setGroupInfo] = useState<IGroup[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
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
      const cancel = message.loading('Submiting')
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
          fetchUserGroups();
          message.success(`Success delete ${groupName} `)
        }
      }
    })
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

  const userInfoColumns: ColumnProps<IUsers>[] = [
    {
      title: 'NickName',
      render(_text, item) {
        if (isEditing) {
          return (
            <FormItem>
              {
                getFieldDecorator('nickName', {
                  initialValue: item.nickName,
                  rules: [
                    { required: true, message: 'nickName is required' }
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
      title: 'UserName',
      render(_text, item) {
        console.log('item', item)
        if (isEditing) {
          return (
            <FormItem>
              {
                getFieldDecorator('userName', {
                  initialValue: item.userName,
                  rules: [
                    
                  ]
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
                  initialValue: item.note,
                  rules: [
                    
                  ]
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
                  initialValue: item.note,
                  rules: [
                    { pattern: emailReg }
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
      title: 'Note',
      render(_text, item) {
        if (isEditing) {
          return (
            <FormItem>
              {
                getFieldDecorator('note', {
                  initialValue: item.note,
                  rules: [
                  ]
                })(
                    <Input />
                  )
              }
              
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
        if (isEditing) {
          return (
            <div style={{display: 'flex', width: '100px', justifyContent: 'space-between'}}>
              <div><a onClick={saveEditing}>SAVE</a></div>
              <div><a onClick={() => setIsEditing(false)}>CANCEL</a></div>
            </div>
          )
        }
        return (
          <a onClick={editCurrentUser}>EDIT</a>
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

  return (
    <>
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

    </>
  )
}



export default connect(({ users, groups, roles }: ConnectState) => ({ users, groups, roles }))(Form.create<FormComponentProps & ConnectProps>()(UserDetail))