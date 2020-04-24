import React, { useState, useEffect } from 'react';
import { Input, Table, Col, Button } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva';
import { Form } from '@ant-design/compatible';
import { useParams } from 'react-router-dom';

import { ColumnProps } from 'antd/es/table';

import { ConnectProps, ConnectState } from '@/models/connect';
import { FormComponentProps } from 'antd/lib/form';

import { getGroupDetail, getGroupRoles, getGroupUsers} from '@/services/groups';

const FormItem = Form.Item;

const Detail: React.FC<FormComponentProps> = ({ form }) => {
  const { id } = useParams();
  const { getFieldDecorator, validateFields } = form;
  const [isGroupInfoEditing, setIsGroupInfoEditing] = useState(false);
  const [groupInfo, setGroupInfo] = useState<{name?: string; note?: string}>({});
  const fetchGroupDetail = async (groupId: number) => {
    const res = await getGroupDetail(groupId);
    if (res.success) {
      setGroupInfo(res.data);
    }
  }

  const fetchGroupUsers = (groupId: number) => {
    //
  }

  const fetchGroupRoles = (groupId: number) => {
    //
  }

  const removeRole = (groupId: number) => {
    //
  }

  const removeUser = (groupId: number) => {
    //
  }
  useEffect(() => {
    if (id) {
      const groupId = Number(id);
      fetchGroupDetail(groupId);
      // fetchGroupDetail(groupId);
      // getGroupRoles(groupId);
    }
  }, [])


  const roleColumns: ColumnProps<any>[] = [
    {
      title: 'Role',
      dataIndex: '',
      key: '',
    },
    {
      title: 'Description',
      dataIndex: '',
      key: '',
    },
    {
      title: 'Role Type',
      dataIndex: '',
      key: '',
    },
    {
      title: 'Action',
      dataIndex: '',
      render(_text, item) {
        return (
          <div>
            <a onClick={() => removeRole(item.id)}>Remove</a>
          </div>
        )
      }
    },
  ]



  const usersColumns: ColumnProps<any>[] = [
    {
      title: 'NickName',
      dataIndex: 'nickName',
      key: 'nickName'
    },
    {
      title: 'UserName',
      dataIndex: 'userName',
      key: 'userName'
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note'
    },
    {
      title: 'Action',
      render(_text, item) {
        return (
          <div>
            <a onClick={() => removeRole(item.id)}>Remove</a>
          </div>
        )
      }
    },
  ];
  const confirmEditing = () => {
    // 
  }
  const toggleEditing = () => {
    setIsGroupInfoEditing(!isGroupInfoEditing);
  }
  
  return (
    <>
      <div className="group-info">
        <h2>Group Info</h2>
        {
          isGroupInfoEditing ?
          <>
            <FormItem label="Group Name">
              {
                getFieldDecorator('name', {
                  rules: [{
                    required: true,
                  }],
                  initialValue: groupInfo.name
                })(
                  <Input />
                )
              }
            </FormItem>
            
            <FormItem label="Group Name">
              {
                getFieldDecorator('note', {
                  rules: [{
                    required: true,
                  }],
                  initialValue: groupInfo.note
                })(
                  <Input />
                )
              }
            </FormItem>
          </>
          :
          <>
            <div><span>Group Name: </span>{groupInfo.name}</div>
            <div><span>Description: </span>{groupInfo.note}</div>
          </>
          
        }
        <div>
          {
            isGroupInfoEditing ? 
            <>
              <Button onClick={confirmEditing} type="primary">CONFIRM</Button>
              <Button onClick={toggleEditing}>CANCEL</Button>
            </>
            :
            <a onClick={toggleEditing}>Edit</a>
          }
          
          
        </div>
      </div>

      <Table columns={roleColumns} title={() => <h2>Role:</h2>} />

      <Table columns={usersColumns} title={() => <h2>User:</h2>}/>

    </>
  )
}

export default connect(({ roles }: ConnectState) => ({roles}))(Form.create()(Detail));