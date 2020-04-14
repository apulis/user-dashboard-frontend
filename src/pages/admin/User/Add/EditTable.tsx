import React, { useState, useEffect } from 'react';
import { Table, Form, Input } from 'antd';

import { ColumnProps } from 'antd/lib/table';
import { FormComponentProps } from '@ant-design/compatible/es/form';

import { emailReg, validateUniqueUserName } from '../../../../utils/validates';
import { IUserMessage } from './index';


interface User extends IUserMessage {

}

interface EditTableProps {
  dataSource: IUserMessage[];
  style?: React.CSSProperties;
  columns?: ColumnProps<any>;
  onChange?: (data: User[]) => any;
  onStatusChange?: (isEditing: boolean) => any;
}

type EditingKey = string | number;

const FormItem = Form.Item;

const EditTable: React.FC<EditTableProps & FormComponentProps> = ({dataSource, style, onChange, form, onStatusChange}) => {
  const dataLength = dataSource.length;
  const [editing, setEditing] = useState<boolean[]>(new Array(dataLength).fill(false));
  const [editingKey, setEditingKey] = useState<EditingKey>('');
  const { getFieldDecorator, validateFields, getFieldsValue} = form;
  useEffect(() => {
    setEditing(new Array(dataLength).fill(false))
    return () => {
    }
  }, [dataSource])
  const columns = [
    {
      title: 'Nickname',
      dataIndex: 'nickName',
      render(_text: any, item: User, index: number) {
        if (editing[index]) {
          return <FormItem>{getFieldDecorator(`userMessage[${index}].nickName`, {
            initialValue: item.nickName,
          })(<Input placeholder="Nickname" />)}</FormItem>
        } else {
          return item.nickName;
        }
      }
    }, {
      title: 'Username',
      dataIndex: 'userName',
      render(_text: any, item: User, index: number) {
        if (editing[index]) {
          return <FormItem>{getFieldDecorator(`userMessage[${index}].userName`, {
            initialValue: item.userName,
            rules: [
              { required: true, message: 'UserName is required'},
              { validator: (...args) => {
                const newArgs = args.slice(0, 4);
                validateUniqueUserName(index, getFieldsValue().userMessage, ...newArgs);
              }}
            ],
          })(<Input placeholder="UserName" />)}</FormItem>
        } else {
          return item.userName;
        }
      }
    }, {
      title: 'Password',
      dataIndex: 'password',
      render(_text: any, item: User, index: number) {
        if (editing[index]) {
          return <FormItem>{getFieldDecorator(`userMessage[${index}].password`, {
            initialValue: item.password,
            rules: [{ required: true, message: 'Password is required'}],
          })(<Input placeholder="Password" />)}</FormItem>
        } else {
          return item.password
        }
      }
    }, {
      title: 'Phone',
      dataIndex: 'phone',
      render(_text: any, item: User, index: number) {
        if (editing[index]) {
          return <FormItem>{getFieldDecorator(`userMessage[${index}].phone`, {
            initialValue: item.phone,
          })(<Input placeholder="Phone" />)}</FormItem>
        } else {
          return item.phone
        }
      }
    }, {
      title: 'Email',
      dataIndex: 'email',
      render(_text: any, item: User, index: number) {
        if (editing[index]) {
          return <FormItem>{getFieldDecorator(`userMessage[${index}].email`, {
            initialValue: item.email,
            rules: [{
              pattern: emailReg,
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
      render(_text: any, item: User, index: number) {
        if (editing[index]) {
          return <FormItem>{getFieldDecorator(`userMessage[${index}].note`, {
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
        if (editing[index]) {
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
    newData[editingKey] = data['userMessage'][editingKey];
    let newEditing = [...editing];
    newEditing = newEditing.map((val, index) => {
      if (index === editingKey) {
        val = false;
      }
      return val;
    })
    onChange && onChange(newData);
    setEditing(newEditing);
    setEditingKey(-1);
  }
  const toggleEditing = (editingKey: EditingKey) => {
    const newEditing = [...editing].map((val, index) => {
      if (index === editingKey) {
        val = !editing[index];
      }
      return val;
    });
    onStatusChange && onStatusChange(newEditing.reduce((temp, val) => temp || val, newEditing[0]))
    setEditing(newEditing);
    if (editing[editingKey]) {
      setEditingKey(-1);
    } else {
      setEditingKey(editingKey);
    }
  }
  return (
    <Table columns={columns} dataSource={dataSource} style={style} />
  )
}



export default Form.create<FormComponentProps & EditTableProps>()(EditTable);