import React, { useState, useEffect } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, Input, Button } from 'antd';
// import { saveAs } from 'file-saver'
import { ColumnProps } from 'antd/lib/table';
import { FormComponentProps } from '@ant-design/compatible/es/form';
// import Excel from 'exceljs/dist/exceljs.bare';
import { emailReg, validateUniqueUserName, mobilePattern, textPattern, userNamePattern } from '@/utils/validates';
import { IUserMessage } from './index';
import styles from '../Detail/index.less';

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
            rules: [
              { min: 4, message: 'Nickname need at least 4 characters' },
              { max: 20, message: 'Nickname cannot be longer than 20 characters' },
              textPattern
            ]
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
              { required: true, message: 'Username is required'},
              { min: 4, message: 'Username need at least 4 characters' },
              { max: 20, message: 'Username cannot be longer than 20 characters' },
              { validator: (...args) => {
                const newArgs = args.slice(0, 4);
                validateUniqueUserName(index, dataSource, ...newArgs);
              }},
              userNamePattern
            ],
          })(<Input placeholder="Username" />)}</FormItem>
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
            rules: [{ required: true, message: 'Password is required'}, { min: 6, message: 'Need at least 6 characters' }, { max: 20, message: 'Cannot be longer than 20 characters' }],
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
            rules: [mobilePattern]
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
            },
            { max: 50, message: 'Email cannot be longer than 50 character' }],
          })(<Input placeholder="Email" />)}</FormItem>
        } else {
          return item.email
        }
      }
    }, {
      title: 'Description',
      dataIndex: 'note',
      render(_text: any, item: User, index: number) {
        if (editing[index]) {
          return <FormItem>{getFieldDecorator(`userMessage[${index}].note`, {
            initialValue: item.note,
            rules: [textPattern, 
              { max: 50, message: 'Description cannot be longer than 50 character' }
          ]
          })(<Input placeholder="Description" />)}</FormItem>
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
              <a style={{ marginRight: 10 }} onClick={() => saveEditingTable(index)}>Save</a>
              <a onClick={() => toggleEditing(index)}>Cancel</a>
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
      { header: 'Nickname', key: 'nickName', width: 36},
      { header: 'Username', key: 'userName', width: 36},
      { header: 'Phone', key: 'phone', width: 36},
      { header: 'Email', key: 'email', width: 36},
      { header: 'Description', key: 'note', width: 36},
    ]
    dataSource.forEach(val => {
      worksheet.addRow(val);
    });
    const buf = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buf]), 'userMessage.xlsx')

  }
  return (
    <div className={styles.editTableWrap}>
      {/* <Button type="primary" onClick={download}>Download</Button> */}
      <Table columns={columns} dataSource={dataSource} style={{...style, marginTop: '20px'}} />
    </div>
  )
}



export default Form.create<FormComponentProps & EditTableProps>()(EditTable);