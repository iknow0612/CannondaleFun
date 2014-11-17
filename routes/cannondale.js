var express = require('express');
var app = express();
var router = express.Router();
var crypto = require( 'crypto');

var User = require( '../models/user.js');
var Bike = require( '../models/bike.js');
var Comment = require( '../models/comment.js');

/* GET cannondale home page. */
router.get('/', function(req, res) {
    Bike.get( null, null, 'name', function( err, bikes){
        if( err) {
            bikes = [];
        }
        //console.log( bikes);
        res.render('index', {
            title: 'Cannondale Fun',
            bikes: bikes,
        });
    });
});
//山地
router.get( '/mountain', function( req, res) {
    Bike.get( null, 'MOUNTAIN', 'name', function( err, bikes){
        if( err) {
            bikes = [];
        }
        //console.log( bikes);
        res.render('index', {
            title: 'Cannondale Fun',
            bikes: bikes,
        });
    });
});
//公路
router.get( '/road', function( req, res) {
    Bike.get( null, 'ROAD', 'name', function( err, bikes){
        if( err) {
            bikes = [];
        }
        //console.log( bikes);
        res.render('index', {
            title: 'Cannondale Fun',
            bikes: bikes,
        });
    });
});

//登录
router.get( '/login', checkNotLogin);
router.get( '/login', function( req, res) {
    res.render('login', {});
});

router.post( '/login', function( req, res) {

    //debug
    //console.log( req.body.username);
    //console.log( req.body.password);

    var md5 = crypto.createHash('md5');
    var password = md5.update( req.body.password).digest('base64');

    //debug
    //console.log( password);

    User.get( req.body.username, function( err, user) {
        //console.log( user);
        if( !user) {
            //console.log( 'username fail');
            req.flash( 'error', '用户名或密码不正确');
            return res.redirect( '/login');
        }
        if( user.password != password) {
            //console.log( 'password fail');
            req.flash( 'error', '用户名或密码不正确');
            return res.redirect( '/login');
        }
        req.session.user = user;
        req.flash( 'success', '登录成功');
        res.redirect( '/manager');
    });

});
//登出
router.get( '/logout', checkLogin);
router.get( '/logout', function( req, res) {
    req.session.user = null;
    req.flash( 'success', '登出成功');
    res.redirect('/');
});
//管理
router.get( '/manager', checkLogin);
router.get( '/manager', function( req, res) {
    Bike.get( null, null, 'name', function( err, bikes){
        if( err) {
            bikes = [];
        }
        //console.log( bikes);
        res.render('manager', {
            title: 'Cannondale Fun',
            bikes: bikes,
        });
    });
});
//编辑自行车
router.get( '/edit/:bikename', checkLogin);
router.get( '/edit/:bikename', function( req, res) {
    Bike.get( req.params.bikename, null, 'price', function( err, bikes) {
        if( err) {
            bikes = [];
        }
        res.render( 'edit', {
            title: 'Cannondale Fun',
            bikes: bikes
        });
    });
});
//保存编辑
router.post( '/edit', checkLogin);
router.post( '/edit', function( req, res) {
    //console.log( req.body.name);
    //console.log( req.body.features);
    Bike.update( req.body.name, req.body.features, function(){
        res.redirect( '/manager#' + req.body.name);
    });

});

//查看bike和评论
router.get( '/bike/:name', function( req, res) {
    Bike.get( req.params.name, null, null,function( err, bikes){
        if( err) {
            bikes = [];
        }
        Comment.get( req.params.name, function( err, comments){
            if( err) {
                comments = [];
            }
            //console.log( comments);
            res.render('bike', {
                title: 'Cannondale Fun',
                bikes: bikes,
                comments: comments,
            });
        });
    });
});
//添加bike
router.post( '/bike', checkLogin);
router.post( '/bike', function( req, res) {
    var bike = new Bike( {
        name: req.body.name,
        features: req.body.features,
        technology: req.body.technology,
        specifications: {
            frame: req.body.frame,
            fork: req.body.fork,
            crank: req.body.crank,
            bottom_bracket: req.body.bottom_bracket,
            shifters: req.body.shifters,
            cog_set: req.body.cog_set,
            chain: req.body.chain,
            front_derailleur: req.body.front_derailleur,
            rear_derailleur: req.body.rear_derailleur,
            rims: req.body.rims,
            hubs: req.body.hubs,
            tires: req.body.tires,
            pedals: req.body.pedals,
            brakes: req.body.brakes,
            handlebar: req.body.handlebar,
            stem: req.body.stem,
            headset: req.body.headset,
            brake_levers: req.body.brake_levers,
            spokes: req.body.spokes,
            grips: req.body.grips,
            saddle: req.body.saddle,
            seatpost: req.body.seatpost,
            rear_shock: req.body.rear_shock,
            extras: req.body.extras,
        },
        geometry: req.body.geometry,
        picurl: req.body.picurl,
        price: {
            eur: req.body.eur,
            etc: req.body.etc,
            gbp: req.body.gbp,
            gtc: req.body.gtc,
        },
    });
    bike.save( function( err) {
        if( err) {
            req.flash( 'error', err);
            return res.redirect( '/manager');
        }
        req.flash( 'success', '添加成功');
        res.redirect( '/manager');
    });
});

//添加评论
router.post('/comment', function( req, res) {
    if( req.body.name == '') {
        req.flash( 'error', '昵称不得为空');
        return res.redirect( '/bike/' + req.body.bikename + '#add_comment');
    }
    if( req.body.content.length < 2) {
        req.flash( 'error', '评论过短');
        return res.redirect( '/bike/' + req.body.bikename + '#add_comment');
    }
    var ip = req.connection.remoteAddress;
    //console.log( ip);
    var comment = new Comment( {
        bikename: req.body.bikename,
        name: req.body.name,
        email: req.body.email,
        content: req.body.content,
        ip: ip,
        });
    //console.log( comment);
    comment.save( function( err) {
        //console.log( req.body.name);
        if( err) {
            req.flash( 'error', err);
            return res.redirect( '/bike/' + req.body.bikename + '#add_comment');
        }
        req.flash( 'success', '评论添加成功');
        res.redirect( '/bike/' + req.body.bikename + '#add_comment');
    });
});

//检查登录状态
function checkLogin( req, res, next) {
    if( !req.session.user) {
        req.flash( 'error', '尚未登录');
        return res.redirect( '/login');
    }
    next();
}

function checkNotLogin( req, res, next) {
    if( req.session.user) {
        req.flash( 'error', '已登录');
        return res.redirect( '/manager');
    }
    next();
}

module.exports = router;
