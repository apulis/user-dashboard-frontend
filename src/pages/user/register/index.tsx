import { Alert, Icon, message, Form, Checkbox } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import React, { Component } from 'react';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { Dispatch, AnyAction } from 'redux';
import { FormComponentProps } from 'antd/es/form';
import { Link, router } from 'umi';
import { connect } from 'dva';
import { StateType } from '@/models/login';
import { SignUpParamsType, signUp } from '@/services/register';
import { ConnectState } from '@/models/connect';
import IconMicrosoft from '@/components/Icon/IconMicrosoft';
import { CurrentUser } from '@/models/user';
import { textPattern, userNamePattern } from '@/utils/validates';
import { userLogout } from '@/services/login';
import { ConfigStateType } from '@/models/config';
import LoginComponents from './components/Login';
import styles from './style.less';

const { Tab, UserName, Password, NickName, Submit } = LoginComponents;

interface RegisterProps {
  dispatch: Dispatch<AnyAction>;
  userLogin: StateType;
  submitting?: boolean;
  currentUser?: CurrentUser;
  config: ConfigStateType;
}
interface LoginState {
  type: string;
  autoLogin: boolean;
}

class Login extends Component<RegisterProps & LoginState & ConnectState & FormComponentProps> {
  loginForm: FormComponentProps['form'] | undefined | null = undefined;

  state: LoginState = {
    type: 'account',
    autoLogin: true,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
    }
    if (this.props.config.authMethods.length === 0) {
      this.props.dispatch({
        type: 'config/fetchAuthMethods',
      })
    }
    window.addEventListener('beforeunload', this.clearAuthInfo)
  }
  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.clearAuthInfo);
  }

  clearAuthInfo = () => {
    console.log(1234234, this.props.currentUser)
    const currentUser = this.props.currentUser;
    if (currentUser && !currentUser.userName) {
      this.props.dispatch({
        type: 'login/logout',
      })
    }
  }

  changeAutoLogin = (e: CheckboxChangeEvent) => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };



  handleSubmit = async (err: unknown, values: SignUpParamsType) => {
    this.props.form.validateFields(['isAgree'], async (error) => {
      if (!error) {
        if (!err) {
          const { userName, password, nickName } = values;
          const submitData: SignUpParamsType = { userName, password, nickName };
          if (this.props.currentUser?.microsoftId && !this.props.currentUser?.userName) {
            submitData.microsoftId = this.props.currentUser?.microsoftId;
          } else if (this.props.currentUser?.wechatId && !this.props.currentUser?.userName) {
            submitData.wechatId = this.props.currentUser.wechatId;
          }
          const res = await signUp(submitData);
          if (res.success === true) {
            // 防止绑定后第二次再去绑定
            await userLogout()
            delete localStorage.token;
            // this.props.dispatch({
            //   type: 'user/fetchCurrent',
            // })
            message.success(formatMessage({ id: 'user-register.register.success.create.account' }));
            router.push('/user/login');
          } else if (res.duplicate) {
            message.error(`${formatMessage({ id: 'users.userName' })} ${userName} ${formatMessage({ id: 'user-register.register.in.use' })}`);
          }
        }
      }
    })
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
    const authMethods = this.props.config.authMethods;
    const { userLogin = {}, submitting, currentUser, config } = this.props;
    let defaultUserName = ''
    if (currentUser && currentUser.microsoftId && (!currentUser.userName)) {
      defaultUserName = currentUser.microsoftId.split('@', 1)[0]
    }
    const { status, type: loginType } = userLogin;
    const { type } = this.state;
    return (
      <div className={styles.main}>
        <LoginComponents
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={(err, values) => { this.handleSubmit(err, values) }}
          onCreate={(form?: FormComponentProps['form']) => {
            this.loginForm = form;
          }}
        >
          <Tab key="account" tab={formatMessage({ id: 'user-register-tab-account-register' })}>
            {status === 'error' &&
              loginType === 'account' &&
              !submitting &&
              this.renderMessage(
                formatMessage({ id: 'user-register.login.message-invalid-credentials' }),
              )}
            <UserName
              name="userName"
              placeholder={`${formatMessage({ id: 'user-register.login.userName' })}`}
              defaultValue={defaultUserName}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'users.add.form.userName.required' }),
                },
                {
                  min: 4,
                  message: formatMessage({ id: 'users.add.form.userName.min' })
                },
                {
                  max: 20,
                  message: formatMessage({ id: 'users.add.form.userName.max' })
                },
                userNamePattern
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
                  max: 20,
                  message: formatMessage({ id: 'users.add.form.nickName.max' })
                },
                textPattern
              ]}
            />
            <Password
              name="password"
              placeholder={`${formatMessage({ id: 'user-register.login.password' })}`}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'user-register.password.required' }),
                },
                {
                  min: 6,
                  message: formatMessage({ id: 'users.add.form.password.min' })
                },
                {
                  max: 20,
                  message: formatMessage({ id: 'users.add.form.password.max' })
                }
              ]}
              onPressEnter={e => {
                e.preventDefault();
                if (this.loginForm) {
                  this.loginForm.validateFields(this.handleSubmit);
                }
              }}
            />
            <Password
              name="password2"
              placeholder={`${formatMessage({ id: 'user-register.register.password2' })}`}
              rules={[
                {
                  validator: async (rule, value, callback) => {
                    const password2Error = await this.loginForm?.getFieldError('password2');
                    if (password2Error) {
                      callback(password2Error);
                      return;
                    }
                    const values = await this.loginForm?.getFieldsValue();
                    if (!values) return;
                    if (values.password !== values.password2) {
                      callback(formatMessage({ id: 'user-register.register.password2.identical' }));
                    }

                  }
                },
              ]}
              onPressEnter={e => {
                e.preventDefault();
                if (this.loginForm) {
                  this.loginForm.validateFields(this.handleSubmit);
                }
              }}
            />
            <Form.Item>
              {this.props.form.getFieldDecorator('isAgree', {
                initialValue: false,
                rules: [
                  {
                    validator: async (rule, value, callback) => {
                      if (!value) {
                        callback('please agree the protocol before registering!');
                      } else {
                        callback();
                      }
                    }
                  },
                ],
              })(
                <Checkbox>
                  I have read the <a href="http://www.baidu.com" target='blank'>User License Agreement</a>
                </Checkbox>,
              )}
            </Form.Item>
          </Tab>
          {
            (currentUser && Object.keys(currentUser).length > 0 && !currentUser.userName) ? <Alert message={`${formatMessage({ id: 'user-register.register.password.need.register' })}${formatMessage({ id: 'common.platform.name' })}`} type="success" /> : <></>
          }
          <Submit loading={submitting}>
            <FormattedMessage id="user-register.register.register" />
          </Submit>
          <div className={styles.other}>
            {
              authMethods.length > 0 && <FormattedMessage id="user-register.register.sign-up-with" />
            }
            {
              authMethods.includes('wechat') &&
              <Icon onClick={() => this.toLogin('wechat')} type="wechat" className={styles.icon} theme="outlined" />
            }
            {
              authMethods.includes('microsoft') && <IconMicrosoft style={{ marginLeft: '15px' }} onClick={() => this.toLogin('microsoft')} />
            }
            <Link className={styles.register} to="/user/login">
              <FormattedMessage id="user-register.register.signin" />
            </Link>
          </div>
        </LoginComponents>
      </div>
    );
  }
}

export default connect(({ login, loading, user, config }: ConnectState) => ({
  userLogin: login,
  submitting: loading.effects['login/login'],
  currentUser: user.currentUser,
  config
}))(Form.create<FormComponentProps>()(Login));
