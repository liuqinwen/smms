var express = require('express');
var router = express.Router();

/* GET users listing. */
//引入连接模块
const connection = require('./connectgoods');

//连接数据库
connection.connect(()=>{
  console.log('数据库连接成功！')
})

//服务器接收数据添加到数据库
router.post('/goodsEnter',(req,res)=>{
      //获取添加的数据
      let {goodsMark,goodsName,enterPrice,goodsAmount} = req.body;
      //测试
     // console.log(username,pass,userlist)
     //构造sql语句
     const sqlStr = 'insert into purchase(goodsMark,goodsName,enterPrice,goodsAmount) values(?,?,?,?)';
     //参数数组
     const sqlPamas = [goodsMark,goodsName,enterPrice,goodsAmount];
     //执行数据库操作
     connection.query(sqlStr,sqlPamas,(err,data)=>{
       if (err) {
         throw err
       } else {
         //判断是否插入成功：影响的行数大于0
         if (data.affectedRows > 0) {
           res.send({"errcode":1,"msg":"商品信息添加成功！！！"})
         } else {
          res.send({"errcode":0,"msg":"很遗憾，添加失败！！！"})
         }
       }
     })
})
//把数据库的数据显示到用户列表上
router.get('/goodsList',(req,res)=>{
    //获取前端发送的数据
    let {pageSize,currentPage} = req.query;
    //console.log(pageSize,currentPage)
    //构造sql语句获取所有的数据
    const sqlStr = 'select * from purchase'
   //执行sql
   connection.query(sqlStr,(err,data)=>{
     if (err) {
       throw err
     } else {
       //获取数据的总条数
       let totalCount = data.length;
       //构造n
       let n = (currentPage - 1)*pageSize;
    //构造sql语句，把要显示的数据显示出来
    const sqlStr1 = `select * from purchase order by ctime desc limit ${n},${pageSize}`;
    //执行sql语句
    connection.query(sqlStr1,(err,data)=>{
      if (err) {
        throw err
      } else {
        res.send({"totalCount":totalCount,"pageData":data})
      }
    })
     }
   })
   
    //res.send('1')
})

//删除商品单个信息操作
router.get ('/goodsDele',(req,res)=>{
  //获取前端发送的ID
  let {id} = req.query;
  //构造sql函数
  const sqlStr = 'delete from purchase  where id ='+ id;
  //执行数据库方法
  connection.query(sqlStr,(err,data)=>{
    if (err) {
      throw err
    } else {
      if (data.affectedRows > 0) {
        res.send({"errcode":1,"msg":"商品信息删除成功！！！"})
      } else {
        res.send({"errcode":0,"msg":"很遗憾，删除失败！！！"})
      }
    }
  })
})

//编辑信息操作
router.get('/goodsEdit',(req,res)=>{
  //拿到ID
    let {id} = req.query;
  //构造sql语句
  //把修改的数据发送给修改页面
  const sqlStr = `select * from purchase where id = ${id}`;
  //执行sql
  connection.query(sqlStr,(err,data)=>{
    if (err) {
      throw err
    } else {
      //console.log(data);
      res.send(data)
    }
  })
});
//把修改的数据覆盖到用户列表
router.post('/goodsEditAdd',(req,res)=>{
         let{goodsMark,goodsName,goodsAmount,enterPrice,id} = req.body;
         //构造sql
         console.log(goodsMark,goodsName,goodsAmount,enterPrice);
         const sqlStr = `update purchase set goodsMark = '${goodsMark}',goodsName = '${goodsName}',goodsAmount = '${goodsAmount}',enterPrice = '${enterPrice}' where id = '${id}'`;
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



module.exports = router;
