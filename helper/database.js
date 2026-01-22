const Sequelize=require("sequelize");

const sequelize=new Sequelize('node-backend','root','qwsdcv123',{dialect:'mysql',host:'localhost'});

module.exports=sequelize;