import React, { useState } from 'react';
import { Table, Form, Input } from 'antd';

import { ColumnProps } from 'antd/lib/table';
import { FormComponentProps } from '@ant-design/compatible/es/form';

import { IUserMessage } from './index';

interface User extends IUserMessage {

}

interface EditTableProps {
  dataSource: IUserMessage[];
  style?: React.CSSProperties;
  columns?: ColumnProps<any>;
  onChange?: (data: User[]) => any;
}

type EditingKey = string | number;

const FormItem = Form.Item;

const EditTable: React.FC<EditTableProps & FormComponentProps> = ({dataSource, style, onChange, form}) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [editingKey, setEditingKey] = useState<EditingKey>('');
  const { getFieldDecorator, validateFields} = form;
  const columns = [
    {
      title: 'Nickname',
      dataIndex: 'nickName',
      render(_text: any, item: User) {
        if (editing) {
          return <FormItem>{getFieldDecorator('nickName', {
            initialValue: item.nickName,
          })(<Input placeholder="Nickname" />)}</FormItem>
        } else {
          return item.nickName
        }
      }
    }, {
      title: 'Username',
      dataIndex: 'userName',
      render(_text: any, item: User) {
        if (editing) {
          return <FormItem>{getFieldDecorator('userName', {
            initialValue: item.userName,
            rules: [{ required: true, message: 'UserName is required'}],
          })(<Input placeholder="UserName" />)}</FormItem>
        } else {
          return item.userName;
        }
      }
    }, {
      title: 'Password',
      dataIndex: 'password',
      render(_text: any, item: User) {
        if (editing) {
          return <FormItem>{getFieldDecorator('password', {
            initialValue: item.password,
            rules: [{ required: true, message: 'Password is required'}],
          })(<Input placeholder="Password" />)}</FormItem>
        } else {
          return item.password
        }
      }
    }, {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      render(_text: any, item: User) {
        if (editing) {
          return <FormItem>{getFieldDecorator('phoneNumber', {
            initialValue: item.phoneNumber,
          })(<Input placeholder="Phone" />)}</FormItem>
        } else {
          return item.phoneNumber
        }
      }
    }, {
      title: 'Email',
      dataIndex: 'email',
      render(_text: any, item: User) {
        if (editing) {
          return <FormItem>{getFieldDecorator('email', {
            initialValue: item.email,
            rules: [{
              pattern: /^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/,
              message: 'Please input corret email'
            }],
          })(<Input placeholder="Email" />)}</FormItem>
        } else {
          return item.email
        }
      }
    }, {
      title: 'Note',
      dataIndex: 'note',
      render(_text: any, item: User) {
        if (editing) {
          return <FormItem>{getFieldDecorator('note', {
            initialValue: item.note
          })(<Input placeholder="Note" />)}</FormItem>
        } else {
          return item.note;
        }
      }
    }, {
      title: 'action',
      dataIndex: 'action',
      width: '13%',
      render(_text: any, item: User, index: number) {
        if (editing) {
          return (
            <>
              <a style={{marginRight: '4px'}} onClick={() => saveEditingTable(index)}>Save</a>
              <a style={{marginLeft: '4px'}}  onClick={() => toggleEditing(index)}>Cancel</a>
            </>
          )
        } else {
          return (
            <a onClick={() => toggleEditing(index)}>Edit</a>
          )
        }
        
      }
    }
  ];
  const saveEditingTable = async (editingKey: EditingKey) => {
    const data = await validateFields();
    const newData = JSON.parse(JSON.stringify(dataSource));
    newData[editingKey] = data;
    onChange && onChange(newData);
    setEditing(false);
    setEditingKey(-1);
  }
  const toggleEditing = (editingKey: EditingKey) => {
    if (editing) {
      setEditing(false);
      setEditingKey(-1);
    } else {
      setEditing(true);
      setEditingKey(editingKey);
    }
  }
  return (
    <Table columns={columns} dataSource={dataSource} style={style} />
  )
}



export default Form.create<FormComponentProps & EditTableProps>()(EditTable);