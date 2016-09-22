/**
 * Created by Administrator on 2016/9/21.
 */
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb://192.168.100.2:27017/plag',function (err,db) {
    if(err){
        console.log(er);
    }else{
        global.mongodb = db;
        console.log('connect to mongo success!')
    }
})