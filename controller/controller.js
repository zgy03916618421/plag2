/**
 * Created by Administrator on 2016/9/20.
 */
'use strict'
var parse = require('co-busboy');
var qiniuUtil = require('../service/qiniuUtil');
var md5 = require('MD5')
var util = require('../service/utilservice');
var infectservice = require('../service/infectedservice');
exports.oauth = function *() {
    var code = this.query.code;
    var redircetUrl = this.query.state;
    console.log(redircetUrl);
    var token = yield client.getAccessToken(code);
    var accessToken = token.data.access_token;
    var openid = token.data.openid;
    var userinfo = yield client.getUser(openid);
    console.log(userinfo);
    this.response.redirect(redircetUrl+'?userid='+userinfo.openid);

}
exports.upPic = function *() {
        console.log(this);
        var parts = parse(this,{limit:'5mb',autoFields: true});
        var part;
        while (part = yield parts){
            if (part != undefined){
                    var name = md5(new Date().valueOf()+Math.random());
                    var rs = yield qiniuUtil.pipe(name,part);
                    var url = qiniuUtil.qiniuhost + name;
            }
        }
        this.body = {"picurl":url};
}
exports.createVirus = function *() {
    var virus = this.request.body;
    var carryid = virus.userid;
    virus.vid = md5(new Date().valueOf()+Math.random());
    virus.createtime = Date.parse(new Date());
    mongodb.collection('virus').insertOne(virus);
    var orderid = md5(new Date().valueOf()+Math.random());
    mongodb.collection('order').insertOne({
        "orderid":orderid,
        "userid" : carryid,
        "vid" : virus.vid,
        "createtime": Date.parse(new Date()),
        "fullfill" : 0
    })
    this.body = 'fuck';
}
exports.fightVirus = function *() {
    var userid = this.params.userid;
    var data = yield infectservice.getVirus(userid);
    this.body = {'data':data};
}
exports.favor = function *() {
    var userid = this.request.body.userid;
    var vid = this.request.body.vid;
    var orderid = md5(new Date().valueOf()+Math.random());
    yield infectservice.favor(userid,vid);
    yield mongodb.collection('order').insertOne({
        "orderid":orderid,
        "userid" : userid,
        "vid" :vid,
        "createtime": Date.parse(new Date()),
        "fullfill" : 0
    });
    this.body = "I DON'T KONW SAY ANYTHING"
}
exports.disfavor = function *() {
    var userid = this.request.body.userid;
    var vid = this.request.body.vid;
    yield infectservice.disfavor(userid,vid);
    this.body =  "I DON'T KONW SAY ANYTHING"
}