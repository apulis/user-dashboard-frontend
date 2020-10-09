/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { notification } from 'antd';
import { router } from 'umi';
import { formatMessage } from 'umi-plugin-react/locale';

let codeMessage: undefined | {[props: string]: string} = undefined;

console.log('codeMessage', codeMessage)

/**
 * 异常处理程序
 */
const errorHandler = (error: { response: Response }): Response => {
  if (!codeMessage) {
    codeMessage = {
      200: formatMessage({id: 'request.code.200'}),
      201: formatMessage({id: 'request.code.201'}),
      202: formatMessage({id: 'request.code.202'}),
      204: formatMessage({id: 'request.code.204'}),
      400: formatMessage({id: 'request.code.400'}),
      401: formatMessage({id: 'request.code.401'}),
      403: formatMessage({id: 'request.code.403'}),
      404: formatMessage({id: 'request.code.404'}),
      406: formatMessage({id: 'request.code.406'}),
      410: formatMessage({id: 'request.code.410'}),
      422: formatMessage({id: 'request.code.422'}),
      500: formatMessage({id: 'request.code.500'}),
      502: formatMessage({id: 'request.code.502'}),
      503: formatMessage({id: 'request.code.503'}),
      504: formatMessage({id: 'request.code.504'}),
    }
  }
  const { response } = error;
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;
    if (status === 401) {
      let href = window.location.href;
      if (!/\/login/.test(href) && !/\/register/.test(href)) {
        router.push('/user/login');
      }
      setTimeout(() => {
        let href = window.location.href;
        if (!/\/login/.test(href) && !/\/register/.test(href)) {
          notification.error({
            message: `Request error`,
            description: errorText,
          });
        }
      }, 20);
      return response;
      
    } else {
      notification.error({
        message: `Request error`,
        description: errorText,
      });
    }
    
  } else if (!response) {
    notification.error({
      description: formatMessage({id: 'request.error.desc'}),
      message: formatMessage({id: 'request.error.message'}),
    });
  }
  return response || {};
};

/**
 * 配置request请求时的默认参数
 */
const request = extend({
  errorHandler, // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
  prefix: '/custom-user-dashboard-backend',
  timeout: 3000,
});

export interface Header extends Headers {
  Authorization: string;
}

request.interceptors.request.use((_url: string, options) => {
  if (localStorage.token) {
    if (options && options.headers) {
      (options.headers as Header).Authorization = 'Bearer ' + localStorage.token;
    }
  }
  return {
    options,
  };
}, { global: false });

export default request;

