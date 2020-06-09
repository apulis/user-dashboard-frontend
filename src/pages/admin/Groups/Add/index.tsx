import React, { useState, useEffect } from 'react';
import { Form } from '@ant-design/compatible';
import { Input, Button, Breadcrumb, Checkbox, Row, Col, Table, message } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { FormComponentProps } from '@ant-design/compatible/es/form';
import { connect } from 'dva';
import router from 'umi/router';
import { ConnectProps, ConnectState } from '@/models/connect';
import { addGroup } from '@/services/groups';
import { ColumnProps } from 'antd/lib/table';
import { IRoleListItem } from '@/models/roles';

export interface IAddUserGroup {
  name: string;
  note: string;
  role: number[];
}

const FormItem = Form.Item;
const { TextArea } = Input;



const Group: React.FC<FormComponentProps & ConnectProps & ConnectState> = ({ form, dispatch, roles }) => {
  const { getFieldDecorator, validateFields } = form;
  const [step, setStep] = useState<number>(1);
  const [submitData, setSubmitData] = useState<IAddUserGroup>();
  const fetchRoles = (pageSize?: number) => {
    dispatch({
      type: 'roles/fetchRoles',
      payload: {
        pageNo: 1,
        pageSize: pageSize || 20,
      }
    })
  }
  useEffect(() => {
    fetchRoles();
  }, [])

  const { total: roleTotal } = roles;
  const rolesList: IRoleListItem[] = roles.list;
  useEffect(() => {
    if (roleTotal > 20) {
      fetchRoles(roleTotal)
    }
  }, [roleTotal])
  const layout = {
    labelCol: { span: 24 },
    wrapperCol: { span: 12 },
  };  
  const next = () => {
    if (step === 1) {
      validateFields((err, values) => {
        if (!err) {
          setSubmitData({...values});
          setStep(step + 1);
        }
      })
    } else if (step === 2) {
      validateFields((err, values) => {
        if (!err) {
          if (!values.role) {
            values.role = [];
          }
          setSubmitData({
            ...submitData,
            ...values,
          });
          setStep(step + 1);
        }
      })
    } else if (step === 3) {
      addGroup(submitData as IAddUserGroup)
        .then(res => {
          if (res.success) {
            message.success('Success');
            router.push('/admin/group/list');
          } else if (res.success === false) {
            message.error(`Group name ${submitData?.name} has exist, please try another`);
          }
        })
    }
  }
  const removeRole = (index: number) => {
    if ([...submitData!.role].length === 1) {
      message.warn('Need at least one role');
      return;
    }
    const newRoleList = [...submitData!.role]
    newRoleList.splice(index, 1);
    setSubmitData({
      ...submitData,
      role: newRoleList,
    } as IAddUserGroup)
  }
  const columns: ColumnProps<{role: number; note: string; isPreset: number}>[] = [
    {
      title: 'Role',
      dataIndex: 'role',
      render(_text, item) {
        console.log(_text, item)
        return (
          <div>{rolesList.find(r => r.id === item.role)?.name}</div>
        )
      }
    },
    {
      title: 'RoleDescription',
      key: 'note',
      render(_text, item) {
        return (
          <div>{item.note}</div>
        )
      }
    },
    {
      title: 'RoleType',
      render(_text, item) {
        return <span>{item.isPreset ? 'Preset Role' : 'Custom Role'}</span>
      }
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render(_text: any, _item: any, index: number) {
        return <a onClick={() => {removeRole(index)}}>Remove</a>
      }
    }
  ];
  const pre = () => {
    setStep(step - 1);
  }
  const tableDataSource = (submitData?.role || []).map(val => {
    const item = rolesList.find(v => v.id === val);
    return {
      role: val,
      isPreset: item ? item.isPreset : '',
      note: item ? item.note : '',
    };
  });
  console.log(tableDataSource)
  return (
    <PageHeaderWrapper>
      {
        step === 1 && <div className="step-1">
          <FormItem label="Group Name" {...layout}>
            {
              getFieldDecorator('name', {
                initialValue: submitData?.name || '',
                rules: [
                  { required: true, message: 'group name is required' },
                  { max: 10, message: 'Cannot be longer than 10 characters' },
                  { whitespace: true, message: 'group name cannot be empty' }
                ],
              })(<Input />)
            }
          </FormItem>
          <FormItem label="Note" {...layout}>
            {
              getFieldDecorator('note', {
                initialValue: submitData?.note || '',
                rules: [
                  { required: true, message: 'note is required'},
                  { max: 40, message: 'Cannot be longer than 40 characters'}
                ],
              })(<TextArea />)
            }
          </FormItem>
        </div>
      }
      {
        step === 2 && <div className="step-2">
          {
            getFieldDecorator('role', {
              initialValue: submitData?.role,
              rules: [
                // { required: true },
              ]
            })(<Checkbox.Group style={{ width: '100%'}}>
              <Row>
                {
                  rolesList.map(r => (
                    <Col span={8}>
                      <Checkbox style={{marginTop: '4px', marginBottom: '4px'}} value={r.id}>{r.name}</Checkbox>
                    </Col>
                  ))
                }
              </Row>
            </Checkbox.Group>)
          }
        </div>
      }
      {
        step === 3 && <div className="step-3">
          <h1>Group Info</h1>
          <div>
            <div>Group Name：{submitData?.name}</div>
            <div>Description: {submitData?.note}</div>
          </div>
          <h1>Role  ({submitData?.role.length})</h1> 
          <Table dataSource={tableDataSource} columns={columns} />
        </div>
      }
      {
        step >=  2 &&
        <Button style={{marginRight: '15px'}} onClick={pre}>PREVIOUS</Button>
      }
      <Button style={{marginTop: '20px'}} type="primary" onClick={next}>{ step === 3 ? 'SUBMIT' : 'Next'}</Button>
    </PageHeaderWrapper>
  );
}


export default connect(({ roles }: ConnectState) => ({roles}))(Form.create<FormComponentProps>()(Group));
