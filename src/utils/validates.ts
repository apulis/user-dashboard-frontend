import emojiRegex from 'emoji-regex';
import { formatMessage } from 'umi-plugin-react/locale';

import { IUserMessage } from "@/pages/admin/User/Add";

export const emailReg =  /^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/;

export const validateUniqueUserName= async (i: number, data: any, _rule?: any, value?: any, callback?: any) => {
  const userMessage = data;
  if (value) {
    userMessage.forEach((user: IUserMessage, index: number) => {
      if (user.userName === value && i !== index) {
        callback(formatMessage({id: 'validates.message.userName.unique'}));
      }
    })
  }
  callback();
};

export const mobilePattern = {
  pattern: /^[1]([3-9])[0-9]{9}$/,
  message: formatMessage({id: 'validates.message.mobile'})
};

const emojiPattern = emojiRegex();

export const textPattern = {
  validator(rule: any, value: any, callback: any, source?: any, options?: any) {
    const data = source[Object.keys(source)[0]];
    if (emojiPattern.test(data)) {
      callback(formatMessage({id: 'validates.message.emoji'}));
      return;
    }
    callback();
  },
}



export const userNamePattern = {
  pattern: /^[\w\.]+$/,
  message: formatMessage({id: 'validates.message.userName.pattern'})
}