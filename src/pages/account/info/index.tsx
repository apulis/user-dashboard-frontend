import React from 'react';
import { connect } from 'dva';
import { Descriptions } from 'antd';

import { ConnectState, ConnectProps } from '@/models/connect';


const Info: React.FC<ConnectProps & ConnectState> = ({ user, dispatch }) => {
  const currentUser = user.currentUser!;
  const { id } = currentUser;
  const bindMicrosoft = () => {
    dispatch({
      type: 'login/oauthLogin',
      payload: {
        bindType: 'microsoft',
        userId: id,
      }
    })
  }
  const bindWechat = () => {
    dispatch({
      type: 'login/oauthLogin',
      payload: {
        bindType: 'wechat',
        userId: id,
      }
    })
  }
  return (
    <>
      <Descriptions title="Account Info">
        <Descriptions.Item label="UserName">{currentUser.userName}</Descriptions.Item>
        <Descriptions.Item label="NickName">{currentUser.nickName || '-'}</Descriptions.Item>
        <Descriptions.Item label="Phone">{currentUser.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="User Id">{currentUser.id}</Descriptions.Item>
        <Descriptions.Item label="Email">{currentUser.email || '-'}</Descriptions.Item>
      </Descriptions>
      <Descriptions title="Login Methods">
        <Descriptions.Item label="Wechat">
          {
            currentUser.wechatId ? <div>Bound</div> : <><span>Not Bound</span><a onClick={bindWechat} style={{marginLeft: '15px'}}>To Bind</a></>
          }
        </Descriptions.Item>
        <Descriptions.Item label="Microsoft">
          {
            currentUser.microsoftId ? <div>Bound</div> : <><span>Not Bound</span><a onClick={bindMicrosoft} style={{marginLeft: '15px'}}>To Bind</a></>
          }
        </Descriptions.Item>
      </Descriptions>
    </>
  )
}

export default connect(({ user }: ConnectState) => ({
  user,
}))(Info);