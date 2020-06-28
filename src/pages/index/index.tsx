import React, { useEffect } from 'react';
import { Card, Col, Row } from 'antd';
import { Link } from 'umi';
import { connect } from 'dva';
import { ConnectState, ConnectProps } from '@/models/connect';
import { formatMessage } from 'umi-plugin-react/locale';


const Index: React.FC<ConnectState & ConnectProps> = ({ users, groups, roles, dispatch }) => {
  const userTotal = users.total;
  const groupTotal = groups.total;
  const roleTotal = roles.total;
  useEffect(() => {
    if (!userTotal) {
      dispatch({
        type: 'users/getUsersTotalCount'
      });
    }
    if (!groupTotal) {
      dispatch({
        type: 'groups/getGroupTotalCount'
      });
    }
    if (!roleTotal) {
      dispatch({
        type: 'roles/getRolesTotalCount'
      });
    }
    
  }, [])
  return (
    <>
      <Row gutter={[32, 16]}>
        <Col lg={8} md={10} sm={12}>
          <Card size="small"
            title={formatMessage({
              id: 'index.users'
            })} 
          extra={<Link to="/admin/user/add">{formatMessage({id: 'index.users.create'})}</Link>} style={{ width: 270 }}
          >
            <h2>{userTotal || 0}</h2>
          </Card>
        </Col>    
        <Col lg={8} md={10} sm={12}>
          <Card size="small"
            title={formatMessage({id: 'index.groups'})} 
            extra={<Link to="/admin/group/add">{formatMessage({id: 'index.groups.create'})}</Link>} style={{ width: 270 }}
          >
            <h2>{groupTotal || 0}</h2>
          </Card>
        </Col>
        <Col lg={8} md={10} sm={12}>
          <Card size="small"
            title={formatMessage({id: 'index.roles'})} 
            extra={<Link to="/admin/role/add">{formatMessage({id: 'index.roles.create'})}</Link>} style={{ width: 270 }}
          >
            <h2>{roleTotal || 0}</h2>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default connect(({ users, groups, roles }: ConnectState) => ({ users, groups, roles }))(Index);