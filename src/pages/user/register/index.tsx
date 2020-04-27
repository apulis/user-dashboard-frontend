import { Alert, Icon, message } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import React, { Component } from 'react';

import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { Dispatch, AnyAction } from 'redux';
import { FormComponentProps } from 'antd/es/form';
import { Link, router } from 'umi';
import { connect } from 'dva';
import { StateType } from '@/models/login';
import LoginComponents from './components/Login';
import styles from './style.less';
import { SignUpParamsType, signUp } from '@/services/register';
import { ConnectState } from '@/models/connect';

import IconMicrosoft from '@/components/Icon/IconMicrosoft';
import { CurrentUser } from '@/models/user';

const { Tab, UserName, Password, NickName, Submit } = LoginComponents;

interface RegisterProps {
  dispatch: Dispatch<AnyAction>;
  userLogin: StateType;
  submitting?: boolean;
  currentUser?: CurrentUser
}
interface LoginState {
  type: string;
  autoLogin: boolean;
}

class Login extends Component<RegisterProps, LoginState> {
  loginForm: FormComponentProps['form'] | undefined | null = undefined;

  state: LoginState = {
    type: 'account',
    autoLogin: true,
  };

  componentDidMount() {
    const { dispatch, currentUser } = this.props;
    if (!currentUser && dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
    }
  }

  changeAutoLogin = (e: CheckboxChangeEvent) => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };

  handleSubmit = async (err: unknown, values: SignUpParamsType) => {
    if (!err) {
      const { userName, password, nickName } = values;
      const res = await signUp({ userName, password, nickName });
      if (res.success === true) {
        message.success('Success Create Account');
        router.push('/user/login');
      } else {
        message.error(res.message);
      }
    }
  };

  onTabChange = (type: string) => {
    this.setState({ type });
  };

  renderMessage = (content: string) => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );
  toLogin = (loginType: string) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'login/oauthLogin',
      payload: {
        loginType, 
      }
    })
  }

  render() {
    const { userLogin = {}, submitting, currentUser } = this.props;
    let defaultUserName = ''
    if (currentUser && currentUser.group === 'Microsoft' && currentUser.openId) {
      defaultUserName = currentUser.openId.split('@', 1)[0]
    }
    const { status, type: loginType } = userLogin;
    const { type } = this.state;
    return (
      <div className={styles.main}>
        <LoginComponents
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          onCreate={(form?: FormComponentProps['form']) => {
            this.loginForm = form;
          }}
        >
          <Tab key="account" tab={formatMessage({ id: 'user-register-tab-account-register' })}>
            {status === 'error' &&
              loginType === 'account' &&
              !submitting &&
              this.renderMessage(
                formatMessage({ id: 'user-login.login.message-invalid-credentials' }),
              )}
            <UserName
              name="userName"
              placeholder={`${formatMessage({ id: 'user-login.login.userName' })}`}
              defaultValue={defaultUserName}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'user-login.userName.required' }),
                },
                {
                  min: 6,
                  message: 'Need at lease 6 letters'
                },
                {
                  max: 22,
                  message: 'Max length is 22'
                }
              ]}
            />
            <NickName
              name="nickName"
              placeholder={`${formatMessage({ id: 'user-register.register.nickName' })}`}
              // 用户未注册，才展示缺省nickName
              defaultValue={(!currentUser?.userName && currentUser) ? currentUser.nickName : ''}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'user-register.nickName.required' }),
                },
                {
                  min: 6,
                  message: 'Need at lease 6 letters'
                },
                {
                  max: 20,
                  message: 'Max length is 20'
                }
              ]}
            />
            <Password
              name="password"
              placeholder={`${formatMessage({ id: 'user-login.login.password' })}`}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'user-login.password.required' }),
                },
                {
                  min: 6,
                  message: 'Need at lease 6 letters'
                },
                {
                  max: 20,
                  message: 'Max length is 20'
                }
              ]}
              onPressEnter={e => {
                e.preventDefault();
                if (this.loginForm) {
                  this.loginForm.validateFields(this.handleSubmit);
                }
              }}
            />
          </Tab>
          {
            (currentUser && !currentUser.userName) ? <Alert message="You have joined, Now need to register for DLWS" type="success" /> : <></>
          }
          <Submit loading={submitting}>
            <FormattedMessage id="user-register.register.register" />
          </Submit>
          <div className={styles.other}>
            <FormattedMessage id="user-register.register.sign-up-with" />
            <Icon onClick={() => this.toLogin('wechat')} type="wechat" className={styles.icon} theme="outlined" />
            <IconMicrosoft style={{marginLeft: '20px'}} onClick={() => this.toLogin('microsoft')} />
            <Link className={styles.register} to="/user/login">
              <FormattedMessage id="user-register.register.signin" />
            </Link>
          </div>
        </LoginComponents>
      </div>
    );
  }
}

export default connect(({ login, loading, user }: ConnectState) => ({
  userLogin: login,
  submitting: loading.effects['login/login'],
  currentUser: user.currentUser
}))(Login);
