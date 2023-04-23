import axios from 'axios'
import { ss } from '@/utils/storage'

const LOCAL_NAME = 'userStorage'

export interface UserInfo {
  avatar: string
  name: string
  description: string
}

export interface ZResponse {
	data: {
		code: number;
		msg: string;
		token: string;
	};
}

export interface UserState {
  userInfo: UserInfo
}

export function defaultSetting(): UserState {
  return {
    userInfo: {
      avatar: 'https://raw.githubusercontent.com/Chanzhaoyu/chatgpt-web/main/src/assets/avatar.jpg',
      name: 'YourName',
      description: '',
    },
  }
}

export function getLocalState(): UserState {
  const localSetting: UserState | undefined = ss.get(LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalState(setting: UserState): void {
  ss.set(LOCAL_NAME, setting)
}

// 获取验证码
export async function getCaptcha() {
  const response = await axios.get('http://54.169.170.129:3002/captcha', { responseType: 'json' })
  return response
}

export async function fetchLogin(data: any): Promise<ZResponse> {
	const response: ZResponse = await axios.post('http://54.169.170.129:3002/login', data)
	return response
}

export async function fetchRegister(data: any): Promise<ZResponse> {
	const response: ZResponse = await axios.post('http://54.169.170.129:3002/register', data)
	return response
}
