import util from 'util'
import mysql from 'mysql'

const db = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'chatgpt-web',
})

// 将数据库查询转换为Promise
db.query = util.promisify(db.query)

export default db
