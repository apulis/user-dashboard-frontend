import React, { useState, useEffect } from 'react';
import { Form } from '@ant-design/compatible';
import { Input, Button, Breadcrumb, Checkbox, Row, Col, Table, message } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { FormComponentProps } from '@ant-design/compatible/es/form';
import { formatMessage } from 'umi-plugin-react/locale';
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
    if (roleTotal > 20 && step === 2) {
      fetchRoles(roleTotal)
    }
  }, [step])
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
            message.success(formatMessage({id: 'groups.add.message.success'}));
            router.push('/admin/group/list');
          }
        })
    }
  }
  const removeRole = (index: number) => {
    const newRoleList = [...submitData!.role].splice(index, 1);
    setSubmitData({
      ...submitData,
      role: newRoleList,
    } as IAddUserGroup)
  }
  const columns: ColumnProps<{role: number; note: string; isPreset: number}>[] = [
    {
      title: formatMessage({id: 'groups.add.role'}),
      dataIndex: 'role',
      render(_text, item) {
        return (
          <div>{rolesList.find(r => r.id === item.role)?.name}</div>
        )
      }
    },
    {
      title: formatMessage({id: 'groups.add.RoleDescription'}),
      key: 'note',
      render(_text, item) {
        return (
          <div>{item.note}</div>
        )
      }
    },
    {
      title: formatMessage({id: 'groups.add.role.type'}),
      render(_text, item) {
        return <span>{item.isPreset ? formatMessage({id: 'groups.add.role.type.preset'}) : formatMessage({id: 'groups.add.role.type.custom'})}</span>
      }
    },
    {
      title: formatMessage({id: 'groups.add.role.type.action'}),
      dataIndex: 'action',
      render(_text: any, _item: any, index: number) {
        return (<a onClick={() => {removeRole(index)}}>
          {formatMessage({id: 'groups.add.role.action.remove'})}
        </a>)
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
          <FormItem label={formatMessage({id: 'groups.add.groupName'})} {...layout}>
            {
              getFieldDecorator('name', {
                initialValue: submitData?.name || '',
                rules: [
                  { required: true, message: formatMessage({id: 'groups.add.form.group.name.required'}) },
                  { max: 20, message: formatMessage({id: 'groups.add.form.group.name.max'}) }
                ],
              })(<Input />)
            }
          </FormItem>
          <FormItem label={formatMessage({id: 'groups.add.note'})} {...layout}>
            {
              getFieldDecorator('note', {
                initialValue: submitData?.note || '',
                rules: [
                  { required: true, message: formatMessage({id: 'groups.add.form.group.note.required'})},
                  { max: 50, message: formatMessage({id: 'groups.add.form.group.note.max'})}
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
                { required: true }
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
          <h1>{formatMessage({id: 'groups.add.step3.title'})}</h1>
          <div>
            <div>{formatMessage({id: 'groups.add.step3.groupName'})}{submitData?.name}</div>
            <div>{formatMessage({id: 'groups.add.step3.note'})}{submitData?.note}</div>
          </div>
          <h1>{formatMessage({id: 'groups.add.step3.role'})}  ({submitData?.role.length})</h1> 
          <Table dataSource={tableDataSource} columns={columns} />
        </div>
      }
      {
        step >=  2 &&
      <Button style={{marginRight: '15px'}} onClick={pre}>
        {formatMessage({id: 'groups.add.previous'})}
      </Button>
      }
      <Button style={{marginTop: '20px'}} type="primary" onClick={next}>
        { step === 3 ? formatMessage({id: 'groups.add.finish'}) : formatMessage({id: 'groups.add.submit'}) }
      </Button>
    </PageHeaderWrapper>
  );
}


export default connect(({ roles }: ConnectState) => ({roles}))(Form.create<FormComponentProps>()(Group));
