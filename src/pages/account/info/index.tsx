import React, { useEffect } from 'react';
import { connect } from 'dva';
import { Descriptions, message } from 'antd';
import { ConnectState, ConnectProps } from '@/models/connect';
import { formatMessage } from 'umi-plugin-react/locale';
import { formatNumber } from 'umi-types/locale';

const Info: React.FC<ConnectProps & ConnectState> = ({ user, dispatch, config }) => {
  const currentUser = user.currentUser!;
  const authMethods = config.authMethods;
  const { id } = currentUser;
  useEffect(() => {
    if (authMethods.length === 0) {
      dispatch({
        type: 'config/fetchAuthMethods',
      })
    }
  }, [])
  useEffect(() => {
    if (localStorage.bindType) {
      if (currentUser.wechatId) {
        message.success(formatMessage({id: 'account.info.message.success.bind.wechat'}));
      } else if (currentUser.microsoftId) {
        message.success(formatMessage({id: 'account.info.message.success.bind.microsoft'}));
      }
      delete localStorage.bindType;
    }
  }, [currentUser])
  const bindMicrosoft = () => {
    localStorage.bindType = 'wechat';
    dispatch({
      type: 'login/oauthLogin',
      payload: {
        loginType: 'microsoft',
        userId: id,
      }
    })
  }
  const bindWechat = () => {
    localStorage.bindType = 'wechat';
    dispatch({
      type: 'login/oauthLogin',
      payload: {
        loginType: 'wechat',
        userId: id,
      }
    })
  }
  return (
    <>
      <Descriptions title={formatMessage({id: 'account.info.title.account.info'})} layout="vertical" bordered>
      <Descriptions.Item label={formatMessage({id: 'account.info.userId'})}>{currentUser.id}</Descriptions.Item>
        <Descriptions.Item label={formatMessage({id: 'users.userName'})}>{currentUser.userName}</Descriptions.Item>
        <Descriptions.Item label={formatMessage({id: 'users.nickName'})}>{currentUser.nickName || '-'}</Descriptions.Item>
        <Descriptions.Item label={formatMessage({id: 'account.info.current.role'})}>{currentUser.currentRole.join(',')}</Descriptions.Item>
        <Descriptions.Item label={formatMessage({id: 'users.phone'})}>{currentUser.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label={formatMessage({id: 'users.email'})}>{currentUser.email || '-'}</Descriptions.Item>
      </Descriptions>
      <Descriptions title={formatMessage({id: 'account.info.login.methods'})} layout="vertical" bordered style={{marginTop: '35px'}}>
        {
          authMethods.includes('wechat') && <Descriptions.Item label={formatMessage({id: 'account.info.method.wechat.account'})}>
          {
            currentUser.wechatId ?
            <div>{formatMessage({id: 'account.info.bound'})}</div>
              :
              <>
                <span>{formatMessage({id: 'account.info.not.bound'})}</span>
                <a onClick={bindWechat} style={{marginLeft: '15px'}}>{formatMessage({id: 'account.info.to.bind'})}</a>
              </>
          }
        </Descriptions.Item>
        }
        {
          authMethods.includes('microsoft') && <Descriptions.Item label={formatMessage({id: 'account.info.method.microsoft.account'})}>
          {
            currentUser.microsoftId ?
            <div>{formatMessage({id: 'account.info.bound'})}</div> :
              <>
                <span>{formatMessage({id: 'account.info.not.bound'})}</span>
                <a onClick={bindMicrosoft} style={{marginLeft: '15px'}}>{formatMessage({id: 'account.info.to.bind'})}</a>
              </>
          }
        </Descriptions.Item>
        }
      </Descriptions>
    </>
  )
}

export default connect(({ user, config }: ConnectState) => ({
  user, config
}))(Info);