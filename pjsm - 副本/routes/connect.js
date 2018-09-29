//引入没有sql模块
const mysql = require('mysql')

//连接数据库

const connection = mysql.createConnection({
            host:'localhost',
            user:'root',
            password:'root',
            database:'admin'
});
module.exports = connection;