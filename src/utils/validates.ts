import emojiRegex from 'emoji-regex';

import { IUserMessage } from "@/pages/admin/User/Add";

export const emailReg =  /^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/;

export const validateUniqueUserName= async (i: number, data: any, _rule?: any, value?: any, callback?: any) => {
  console.log('callback', callback)
  const userMessage = data;
  if (value) {
    userMessage.forEach((user: IUserMessage, index: number) => {
      if (user.userName === value && i !== index) {
        callback('UserName needs unique');
      }
    })
  }
  callback();
};

export const mobilePattern = {
  pattern: /^[1]([3-9])[0-9]{9}$/,
  message: "please enter a valid phone number"
};

const emojiPattern = emojiRegex();

export const textPattern = {
  validator(rule: any, value: any, callback: any, source?: any, options?: any) {
    const data = source[Object.keys(source)[0]];
    if (emojiPattern.test(data)) {
      callback('Could not contains emoji');
      return;
    }
    callback();
  },
}



export const userNamePattern = {
  pattern: /^[\w\.]+$/,
  message: "Must be composed of letter, numbers, underscore or point"
}