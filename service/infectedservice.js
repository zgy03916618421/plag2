/**
 * Created by Administrator on 2016/9/21.
 */
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
    var orders = yield mongodb.collection('order').find({"fullfill":{$lt:4}}).toArray();
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
            yield mongodb.collection('infected').insertOne({'carryid':doc.userid,'vid':virusid,'infectid':userid});
            yield mongodb.collection('order').updateOne({'orderid':doc.orderid},{$set:{'fullfill':doc.fullfill+1}});
            var virus = yield mongodb.collection('virus').find({'vid':virusid}).toArray();
            var userinfo = yield mongodb.collection('user').find({'openid':virus[0].userid}).toArray();
            var patientNumber = yield mongodb.collection('infected').find({'vid':virusid}).toArray().length;
            var data ={};
            data.virus = virus[0];
            data.userinfo = userinfo[0];
            data.patientNumber = patientNumber;
            return {'head':{code:200,msg:'success'},'data':data};

        }else{
            return {'head':{code: 1000,msg:'no virus'}};
        }

    }
}
exports.favor = function *(userid,vid) {
    var doc = {};
    doc.orderid = md5(new Date().valueOf()+Math.random());
    doc.ueserid = userid;
    doc.vid = vid;
    doc.fullfill = 0 ;
    doc.createtime = Date.parse(new Date());
    yield mongodb.collection('order').insertOne(doc);
    yield mongodb.collection('action').insertOne({'userid':userid,'vid':vid,'action':'spread'});
}
exports.disfavor = function *(userid,vid) {
    yield mongodb.collection('action').insertOne({'userid':userid,'vid':vid,'action':'skip'});
}