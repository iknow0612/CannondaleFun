var mongodb = require( './db')

function Bike( bike, time) {
    this.name = bike.name;
    this.features = bike.features;
    this.technology = bike.technology;
    this.specifications = bike.specifications;
    this.geometry = bike.geometry;
    this.picurl = bike.picurl;
    this.price = bike.price;
    if( time) {
        this.time = time;
    } else {
        this.time = new Date();
    }
};

module.exports = Bike;

Bike.prototype.save = function save( callback) {
    //存入Mongodb
    var bike = {
        name: this.name,
        features: this.features,
        technology: this.technology,
        specifications: this.specifications,
        geometry: this.geometry,
        picurl: this.picurl,
        price: this.price,
        time: this.time
    };
    mongodb.open( function( err, db) {
        if( err) {
            return callback( err);
        }
        //读取bike集合
        db.collection( 'bikes', function( err, collection) {
            if( err) {
                mongodb.close();
                return callback( err);
            }
            //写入文档
            collection.insert( bike, { safe: true}, function( err, bike) {
                mongodb.close();
                callback( err, bike);
            });
        });
    });

};

Bike.get = function get ( name, type, callback) {
    mongodb.open( function( err, db) {
        if( err) {
            return callback( err);
        }

        db.collection( 'bikes', function( err, collection) {
            if( err) {
                mongodb.close();
                return callback( err);
            }
            var qry = {};
            if( name) {
                qry.name = name;
            }
            if( type) {
                qry.type = type;
            }
            collection.find( qry).sort( {price: -1}).toArray( function( err, docs){
                mongodb.close();
                if( err) {
                    callback( err, null);
                }

                var bikes = [];
                docs.forEach( function( doc, index) {
                    var bike = new Bike( doc, doc.time);
                    bikes.push( bike);
                });
                //console.log( bikes);
                callback( null, bikes);
            });
        });
    });
};
