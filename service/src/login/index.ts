import type { Request, Response } from 'express'
import express from 'express'
import svgCaptcha from 'svg-captcha'
import { v4 as uuidv4 } from 'uuid';

const router = express.Router()

// 生成验证码并将其存储在会话中
router.get('/', (req: Request, res: Response) => {
	const captcha = svgCaptcha.create();
	const uuid = uuidv4(); // 生成一个新的UUID
	req.session.captcha = captcha.text;
	req.session.uuid = uuid; // 将UUID存储在会话中

	const json = {
		uuid: uuid,
		img: captcha.data,
	};

	res.json(json);
});

export default router
