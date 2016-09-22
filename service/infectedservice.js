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
        return 'virus has end-all';
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
        console.log(virusids)
        var virusid = underscore.sample(virusids);
        console.log(virusid);
        var order = yield mongodb.collection('order').find({'vid':virusid}).toArray();
        var selectOrder = underscore.sample(order);
        console.log(selectOrder);
        var doc = selectOrder;
        yield mongodb.collection('infected').insertOne({'carryid':doc.userid,'vid':virusid,'infectid':userid});
        yield mongodb.collection('order').updateOne({'orderid':doc.orderid},{$set:{'fullfill':doc.fullfill+1}});
        var virus = yield mongodb.collection('virus').find({'vid':virusid}).toArray();
        return virus[0];
    }
}
exports.favor = function *(userid,vid) {
    var doc = {};
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