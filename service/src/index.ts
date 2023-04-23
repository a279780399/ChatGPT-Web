import type { NextFunction, Request, Response } from 'express'
import express from 'express'
import bodyParser from 'body-parser'
import bcrypt from 'bcryptjs'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import type { RequestProps } from './types'
import type { ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, currentModel } from './chatgpt'
import { auth } from './middleware/auth'
import { limiter } from './middleware/limiter'
import { isNotEmptyString } from './utils/is'
import jwt from 'jsonwebtoken'

import db from './db'
import captchaRouter from './login'

const app = express()
const router = express.Router()
const secretKey = 'your-secret-key' // 填写自己的密钥

app.use(express.static('public'))
app.use(express.json())
// 添加中间件
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.use(cookieParser())
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}))

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

app.use('/captcha', captchaRouter)

// 注册路由
app.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
		const { username, email, password, captcha } = req.body

    // 验证验证码是否匹配
    // if (captcha !== req.session.captcha)
    //   return res.status(400).send('Invalid captcha')

    // 检查用户名和电子邮件是否已经存在
    const user = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email])
    if (user.length > 0)
      return res.status(400).send('Username or email already in use')

    // 对密码进行哈希，然后将用户插入到数据库中
    const hashedPassword = await bcrypt.hash(password, 10)
    await db.query('INSERT INTO users SET ?', { username, email, password: hashedPassword })

    res.status(201).send('User created successfully')
  }
  catch (error) {
    console.error(error)
    res.status(500).send('Error creating user')
  }
})

// 登录路由
app.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, captcha } = req.body

    // 验证验证码是否匹配
    // if (captcha !== req.session.captcha)
    //   return res.status(400).send('Invalid captcha')

    // 检查用户名是否存在
    const user = await db.query('SELECT * FROM users WHERE username = ?', [username])
    if (user.length === 0)
      return res.status(400).send('Invalid username or password')

    // 检查密码是否匹配
    const isMatch = await bcrypt.compare(password, user[0].password)
    if (!isMatch)
      return res.status(400).send('Invalid username or password')

		// 生成 token
		const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' })

		res.json({ code: 200, msg: 'Login successful', token })
  }
  catch (error) {
    console.error(error)
    res.status(500).send('Error logging in')
  }
})

router.post('/chat-process', [auth, limiter], async (req, res) => {

	if (!verifyToken(req, res)) {
		res.write('\n{"message":"用户信息已过期请重新登陆！"}')
		res.end()
		return
	}

  res.setHeader('Content-type', 'application/octet-stream');

  try {
    const { prompt, options = {}, systemMessage, temperature, top_p } = req.body as RequestProps
    let firstChunk = true
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        firstChunk = false
      },
      systemMessage,
      temperature,
      top_p,
    })
  }
  catch (error) {
    res.write(JSON.stringify(error))
  }
  finally {
    res.end()
  }
})

router.post('/config', auth, async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/session', async (req, res) => {
  try {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel() } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body as { token: string }
    if (!token)
      throw new Error('Secret key is empty')

    if (process.env.AUTH_SECRET_KEY !== token)
      throw new Error('密钥无效 | Secret key is invalid')

    res.send({ status: 'Success', message: 'Verify successfully', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

function verifyToken(req, res) {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (!token) {
		return false // token 验证不通过
	}

	let isVerified = false
	jwt.verify(token, secretKey, (err, user) => {
		if (err) {
			isVerified = false // token 验证不通过
		} else {
			isVerified = true // token 验证通过
		}
	})

	return isVerified
}

app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))
