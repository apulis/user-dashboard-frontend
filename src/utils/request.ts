/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { notification } from 'antd';
import { router } from 'umi';

const codeMessage = {
  200: 'The server successfully returned the requested data',
  201: 'New or modified data was successful.',
  202: 'A request has been queued in the background (asynchronous task).',
  204: 'Data deleted successfully.',
  400: 'There was an error in the request, and the server did not create or modify data.',
  401: 'Does not have permission.',
  403: 'You are authorized, but access is prohibited.',
  404: 'The request was made for a record that does not exist, and the server did not operate',
  406: 'The requested type is not available.',
  410: 'The requested resource is permanently deleted and is no longer available.',
  422: 'When creating an object, a validation error occurred.',
  500: 'A server error occurred. Please check the server.',
  502: 'Gateway error.',
  503: 'Service is unavailable, server is temporarily overloaded or maintained。',
  504: 'Gateway timed out.',
};

/**
 * 异常处理程序
 */
const errorHandler = (error: { response: Response }): Response => {
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
      description: 'Network anomalies, please try again later',
      message: 'Network anomalies',
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

