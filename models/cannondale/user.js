var mongodb = require( './db')

function User( user) {
    this.name = user.name;
    this.password = user.password;
};

module.exports = User;

User.prototype.save = function save( callback) {
};

User.get = function get( username, callback) {
    mongodb.open( function( err, db) {
        if( err) {
            return callback( err);
        }
        //读取users集合
        db.collection( 'users', function( err, collection) {
            if( err) {
                mongodb.close();
                return callback( err);
            }
            //查找name属性为username的文档
            collection.findOne( { name: username}, function( err, doc) {
                mongodb.close();
                if( doc) {
                    var user = new User( doc);
                    callback( err, user);
                } else {
                    callback( err, null);
                }
            });
        });
    });
};
