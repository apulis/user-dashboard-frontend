import React, { useState, useEffect } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, Input, Button } from 'antd';
import { saveAs } from 'file-saver'

import { ColumnProps } from 'antd/lib/table';
import { FormComponentProps } from '@ant-design/compatible/es/form';
import Excel from 'exceljs/dist/exceljs.bare';


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
              { min: 4, message: 'min length is 4' },
              { validator: (...args) => {
                const newArgs = args.slice(0, 4);
                validateUniqueUserName(index, dataSource, ...newArgs);
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
            rules: [{ required: true, message: 'Password is required'}, { min: 6, message: 'min length is 6' }],
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
    onStatusChange && onStatusChange(newEditing.reduce((temp, val) => temp || val, newEditing[0]))
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
  const download = async () => {
    const workbook = new Excel.Workbook();
    workbook.addWorksheet('userMessage');
    const worksheet = workbook.getWorksheet('userMessage');
    worksheet.columns = [
      { header: 'NickName', key: 'nickName', width: 36},
      { header: 'UserName', key: 'userName', width: 36},
      { header: 'Phone', key: 'phone', width: 36},
      { header: 'Email', key: 'email', width: 36},
      { header: 'Note', key: 'note', width: 36},
    ]
    dataSource.forEach(val => {
      worksheet.addRow(val);
    });
    const buf = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buf]), 'userMessage.xlsx')

  }
  return (
    <>
      <Button type="primary" onClick={download}>Download</Button>
      <Table columns={columns} dataSource={dataSource} style={{...style, marginTop: '20px'}} />
    </>
  )
}



export default Form.create<FormComponentProps & EditTableProps>()(EditTable);