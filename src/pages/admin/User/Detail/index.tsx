import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Form } from '@ant-design/compatible';
import { PageHeader, Table, Input, message } from 'antd';
import { router } from 'umi';
import { useParams } from 'react-router-dom';


import { FormComponentProps } from 'antd/lib/form';
import { ColumnProps } from 'antd/es/table';

import { getUserById, getUserRolesById, editUserInfo } from '@/services/users';
 
import { ConnectState, ConnectProps } from '@/models/connect';
import { IUsers } from '@/models/users';
import { emailReg } from '@/utils/validates';


const FormItem = Form.Item;



const UserDetail: React.FC<FormComponentProps & ConnectProps & ConnectState> = ({ form, users, groups }) => {
  const { id } = useParams();
  const { getFieldDecorator, validateFields } = form;
  const groupId = Number(id);
  const [userInfo, setUserInfo] = useState<IUsers>({userName: '', nickName: '', id: 0});
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const fetchUserById = async () => {
    const res = await getUserById(groupId);
    if (res.success) {
      setUserInfo(res.user);
    }
  }
  const editCurrentUser = () => {
    setIsEditing(true);
  }
  const saveEditing = () => {
    validateFields(async (err, values) => {
      if (err) return;
      const cancel = message.loading('Submiting')
      const res = await editUserInfo(groupId, values);
      cancel();
      if (res.success) {
        message.success('success edit');
        fetchUserById();
      }
      setIsEditing(false);
    })
  }
  useEffect(() => {
    if (isNaN(Number(id))) {
      router.push('/admin/user/list')
    }
  }, [id]);

  useEffect(() => {
    fetchUserById();
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

    </>
  )
}



export default connect(({ users, groups, roles }: ConnectState) => ({ users, groups, roles }))(Form.create<FormComponentProps & ConnectProps>()(UserDetail))