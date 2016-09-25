/**
 * Created by Administrator on 2016/9/21.
 */
var md5 = require('MD5');
var underscore = require('underscore');
/*exports.infect = function *(carryid,vid,infectid,orderid) {
     mongodb.collection('infected').insertOne({
        "carryid" :carryid,
        "vid" :vid,
        "infectid" :infectid,
        "orderid" : orderid,
        "createtime" : Date.parse(new Date())
    })
}*/
exports.getVirus = function *(userid) {
    var total = yield mongodb.collection('order').find().toArray();
    var orders = underscore.filter(total,function (data) {
        return data.fullfill < data.speed;
    })
    if (!orders.length){
        var data = {'head':{code: 1000,msg:'no virus'}};
        return data
    }else{
        var user = yield  mongodb.collection('infected').find({"infectid":userid}).toArray();
        var Ovids = [];
        var Uvids = [];
        orders.forEach(function (value,index,arry) {
            Ovids.push(value.vid);
        })
        user.forEach(function (value,index,arry) {
            if(value.vid !== undefined){
                Uvids.push(value.vid);
            }
        })
        var virusids = underscore.difference(Ovids,Uvids);
        if(virusids.length){
            var virusid = underscore.sample(virusids);
            var order = yield mongodb.collection('order').find({'vid':virusid}).toArray();
            var selectOrder = underscore.sample(order);
            var doc = selectOrder;
            yield mongodb.collection('infected').insertOne({'carryid':doc.userid,'vid':virusid,'infectid':userid,'orderid':doc.orderid});
            yield mongodb.collection('order').updateOne({'orderid':doc.orderid},{$set:{'fullfill':doc.fullfill+1}});
            var virus = yield mongodb.collection('virus').find({'vid':virusid}).toArray();
            var userinfo = yield mongodb.collection('user').find({'openid':virus[0].userid}).toArray();
            var patients = yield mongodb.collection('infected').find({'vid':virusid}).toArray();
            var patientNumber = patients.length;
            var data ={};
            data.order = doc
            data.virus = virus[0];
            data.userinfo = userinfo[0];
            data.patientNumber = patientNumber;
            return {'head':{code:200,msg:'success'},'data':data};
        }else{
            return {'head':{code: 1000,msg:'no virus'}};
        }

    }
}
exports.favor = function *(userid,vid,speed) {
    var doc = {};
    doc.orderid = md5(new Date().valueOf()+Math.random());
    doc.ueserid = userid;
    doc.vid = vid;
    doc.fullfill = 0 ;
    doc.speed = speed;
    doc.createtime = Date.parse(new Date());
    yield mongodb.collection('order').insertOne(doc);
    yield mongodb.collection('action').insertOne({'userid':userid,'vid':vid,'action':'spread'});
}
exports.disfavor = function *(userid,vid) {
    yield mongodb.collection('action').insertOne({'userid':userid,'vid':vid,'action':'skip'});
}
exports.speedV1 = function *(order,userid) {
    var user = yield mongodb.collection('user').find({'openid':userid}).toArray();
    if(user.balance < 100){
        return {'head':{code:600,msg:'no balance'}};
    }else{
        yield mongodb.collection('user').updateOne({'openid':userid},{$inc:{'balance':-100}});
        var path = [];
        while (1){
            var parentInfect = yield mongodb.collection('infected').find({'infectid':order.userid,'vid':order.vid}).toArray();
            console.log(parentInfect);
            var parentOrder = yield mongodb.collection('order').find({'orderid':parentInfect[0].orderid}).toArray();
            console.log(parentOrder);
            if(parentOrder[0].speed == 16){
                path.push(parentOrder[0].userid);
            }
            if(parentInfect[0].carryid == parentInfect[0].infectid){
                path.push(parentOrder[0].userid);
                break;
            }
            order = parentOrder[0];
        }
        console.log(path);
        if(path.length ==1){
            yield mongodb.collection('user').updateOne({'openid':path[0]},{$inc:{'balance':50}});
        }else{
            yield mongodb.collection('user').updateOne({'openid':path[path.length-1]},{$inc:{'balance':50}})
            for (var i =0;i<path.length-1;i++){
                yield mongodb.updateOne({'openid':value},{$inc:{'balance':parseInt(50/(arr.length-1))}});
            }
        }
        return {'head':{code: 300,msg:'success'}};
    }
}
exports.recharge = function *(money,userid) {
    yield mongodb.collection('user').updateOne({'openid':userid},{$inc:{'balance':money*1000}});
}
exports.speedv2 = function *(vid,userid) {
    var user = yield mongodb.collection('user').find({'openid':userid}).toArray();
    if(user.balance < 100){
        return {'head':{code:600,msg:'no balance'}};
    }else{
        yield mongodb.collection('user').updateOne({'openid':userid},{$inc:{'balance':-100}});
        var path = [];
        while (1){
            var parentInfect = yield mongodb.collection('infected').find({'infectid':userid,'vid':vid}).toArray();
            console.log(parentInfect);
            var parentOrder = yield mongodb.collection('order').find({'userid':parentInfect[0].carryid}).toArray();
            console.log(parentOrder);
            if(parentOrder[0].speed == 16){
                path.push(parentOrder[0].userid);
            }
            if(parentInfect[0].carryid == parentInfect[0].infectid){
                path.push(parentOrder[0].userid);
                break;
            }
            userid = parentInfect[0].carryid;
        }
        console.log(path);
        if(path.length ==1){
            yield mongodb.collection('user').updateOne({'openid':path[0]},{$inc:{'balance':50}});
        }else{
            yield mongodb.collection('user').updateOne({'openid':path[path.length-1]},{$inc:{'balance':50}})
            for (var i =0;i<path.length-1;i++){
                yield mongodb.updateOne({'openid':value},{$inc:{'balance':parseInt(50/(arr.length-1))}});
            }
        }
        return {'head':{code: 300,msg:'success'}};
    }
}