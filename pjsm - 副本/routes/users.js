var express = require('express');
var router = express.Router();

/* GET users listing. */
//引入连接模块
const connection = require('./connect');

//连接数据库
connection.connect(()=>{
  console.log('数据库连接成功！')
})

//检测用户名和密码是否正确
router.post('/loginCheck',(req,res)=>{
  //获取填入的信息
  let {username,pass} = req.body;
  //根据填入的信息查找数据库 构建sql语句
  let sqlStr = `select * from users where username = '${username}' and pass = '${pass}'`
 //执行sql语句
 connection.query(sqlStr,(err,data)=>{
   if (err) {
     throw err
   } else {
     if (data.length) {
       //够着cookie
       res.cookie("username",data[0].username);
       //res.cookie("pass",data[0].pass);
       res.cookie("userlist",data[0].userlist);  
       res.cookie("id",data[0].id);     
       res.send({"errcode":1,"msg":"登录成功！！！"})
     } else {
       res.send({"errcode":0,"msg":"登录失败，用户名或密码错误！！！"})       
     }
   }
 })
})

//检测用户是否已经登录
router.get('/checkIsLog',(req,res)=>{
  let username = req.cookies.username

  if (username) {
    res.send('console.log("你已登录")')
  } else {
    res.send('alert("请登录后在访问该页面");location.href="./login.html";')
  }
})

//登出时检测清除cookie
router.get('/logout',(req,res)=>{
  res.clearCookie('username');
  //res.clearCookie('pass');
  res.clearCookie('userlist');
  res.clearCookie('id');
  //退出到登录页面
  res.send('<script>alert("退出成功");location.href="http://localhost:333/login.html";</script>')
})

//服务器接收数据添加到数据库
router.post('/userAdd',(req,res)=>{
      //获取添加的数据
      let {username,pass,userlist} = req.body;
      //测试
     // console.log(username,pass,userlist)
     //构造sql语句
     const sqlStr = 'insert into users(username,pass,userlist) values(?,?,?)';
     //参数数组
     const sqlPamas = [username,pass,userlist];
     //执行数据库操作
     connection.query(sqlStr,sqlPamas,(err,data)=>{
       if (err) {
         throw err
       } else {
         //判断是否插入成功：影响的行数大于0
         if (data.affectedRows > 0) {
           res.send({"errcode":1,"msg":"用户信息添加成功！！！"})
         } else {
          res.send({"errcode":0,"msg":"很遗憾，添加失败！！！"})
         }
       }
     })
})

//把数据库的数据显示到用户列表上
router.get('/userList',(req,res)=>{
    //获取前端发送的数据
   let { pageSize,currentPage } = req.query;
    //构造sql语句，获取数据库中所有的数据
    const sqlStr = 'select * from users';
    //执行sql语句
    connection.query(sqlStr,(err,data)=>{
      if (err) {
        throw err
      } else {
        //获取数据的总条数
        let totalCount = data.length;
        //构造算法
        let n = (currentPage - 1)*pageSize;
        //构造sql语句
        const sqlStr1 = `select * from users order by ctime desc limit ${n},${pageSize}`;
        //执行数据库
        connection.query(sqlStr1,(err,data)=>{
          if (err) {
            throw err
          } else {
            res.send({"totalCount":totalCount,"pageData":data})
          }
        })

      }
    })

})

//删除用户单个信息操作
router.get ('/userDele',(req,res)=>{
  //获取前端发送的ID
  let {id} = req.query;
  //构造sql函数
  const sqlStr = 'delete from users  where id ='+ id;
  //执行数据库方法
  connection.query(sqlStr,(err,data)=>{
    if (err) {
      throw err
    } else {
      if (data.affectedRows > 0) {
        res.send({"errcode":1,"msg":"用户信息删除成功！！！"})
      } else {
        res.send({"errcode":0,"msg":"很遗憾，删除失败！！！"})
      }
    }
  })
})

//编辑信息操作
router.get('/userEdit',(req,res)=>{
  //拿到ID
    let {id} = req.query;
    
   //构造sql语句
   const sqlStr = `select * from users where id = ${id}`;
   //执行语句
   connection.query(sqlStr,(err,data)=>{
     if (err) {
       throw err
     } else {
       res.send(data);
     }
   })  
  })

//把修改的数据覆盖到用户列表
router.post('/usereditAdd',(req,res)=>{
         let{username,pass,userlist,id} = req.body;
         //构造sql
         //console.log(username,pass,userlist,id);
         const sqlStr = `update users set username = '${username}',pass = '${pass}',userlist = '${userlist}' where id = ${id}`;
         //执行sql
         connection.query(sqlStr,(err,data)=>{
           if (err) { 
             throw err
           } else {
             
             if (data.affectedRows > 0) {
               res.send({"errcode":1,"msg":"用户信息修改成功！！！"})
             } else {
              res.send({"errcode":0,"msg":"很遗憾修改失败！！！"})     
             }
           }
         })  
})

// 批量删除选中的数据
//接收前端
router.post('/selectDele',(req,res)=>{
  //获取ID数组
  let idArr = req.body['idArr[]'];
  console.log(idArr)
  //根据数组构造sql语句
  const sqlStr = `delete from users where id in (${idArr})`;
  //执行sql操作
  connection.query(sqlStr,(err,data)=>{
    if (err) {
      throw err
    } else {
      if (data.affectedRows > 0) {
        res.send({"errcode":1,"msg":"删除成功"})
      } else {
        res.send({"errcode":0,"msg":"删除失败"})
      }
    }
  })
});

//修改密码操作
//验证旧密码是否输入正确
router.get('/checkoldPass',(req,res)=>{
  //获取前端输入的旧密码
  let {oldPass} = req.query;
  //console.log(oldPass)
  //获取登录者的id
  const id = req.cookies.id;
  //构造sql语句 根据id查找出登录用户的数据
  const sqlStr = `select * from users where id = ${id}`
  //执行sql语句
  connection.query(sqlStr,(err,data)=>{
    if (err) {
      throw err
    } else {
      if (data[0].pass === oldPass) {
        res.send({"errcode":1,"msg":"旧密码输入正确"})
      } else {
        res.send({"errcode":0,"msg":"旧密码输入错误"})   
      }
    }
  })
})

//修改保存新密码
router.post('/passEdit',(req,res)=>{
  //获取添加的新密码
  let {newPass} = req.body;
  //获取登陆者的id
  const id = req.cookies.id;
  //够着sql语句,根据ID查找出需要修改的用户信息 修改密码
  const sqlStr = `update users set pass='${newPass}' where id = ${id}`;
  //执行数据库
  connection.query(sqlStr,(err,data)=>{
    if (err) {
      throw err
    } else {
      if (data.affectedRows > 0) {
        res.clearCookie('username');
        //res.clearCookie('pass');
        res.clearCookie('userlist');
        res.clearCookie('id');
        res.send({"errcode":1,"msg":"密码修改成功"})
      } else {
        res.send({"errcode":0,"msg":"密码修改失败"})
      }
    }
  })
})





module.exports = router;
