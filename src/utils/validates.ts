import { IUserMessage } from "@/pages/admin/User/Add";




export const emailReg =  /^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/;

export const validateUniqueUserName= async (i: number, data: any, _rule?: any, value?: any, callback?: any) => {
  const userMessage = data;
  if (value) {
    userMessage.forEach((user: IUserMessage, index: number) => {
      if (user.userName === value && i !== index) {
        callback('用户名需要唯一');
      }
    })
  }
  callback();
}