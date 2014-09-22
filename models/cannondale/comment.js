var mongodb = require( './db')

function Comment( comment, time) {
    this.bikename = comment.bikename;
    this.name = comment.name;
    this.email = comment.email;
    this.ip = comment.ip;
    this.content = comment.content;
    if( time) {
        this.time = time;
    } else {
        this.time = new Date();
    }
};

module.exports = Comment;

Comment.prototype.save = function save( callback) {
    //存入Mongodb
    var comment = {
        bikename: this.bikename,
        name: this.name,
        email: this.email,
        ip: this.ip,
        content: this.content,
        time: this.time
    };
    mongodb.open( function( err, db) {
        if( err) {
            return callback( err);
        }
        //读取comment集合
        db.collection( 'comments', function( err, collection) {
            if( err) {
                mongodb.close();
                return callback( err);
            }
            //写入文档
            collection.insert( comment, { safe: true}, function( err, bike) {
                mongodb.close();
                callback( err, bike);
            });
        });
    });

};

Comment.get = function get ( bikename, callback) {
    mongodb.open( function( err, db) {
        if( err) {
            return callback( err);
        }

        db.collection( 'comments', function( err, collection) {
            if( err) {
                mongodb.close();
                return callback( err);
            }
            var qry = {};
            if( bikename) {
                qry.bikename = bikename;
            }
            collection.find( qry).sort( {time: 1}).toArray( function( err, docs){
                mongodb.close();
                if( err) {
                    callback( err, null);
                }

                var comments = [];
                docs.forEach( function( doc, index) {
                    var comment = new Comment( doc, doc.time);
                    comments.push( comment);
                });
                //console.log( comment);
                callback( null, comments);
            });
        });
    });
};
