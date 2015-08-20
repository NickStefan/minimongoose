var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/minimongoose4');

var Schema = mongoose.Schema;

var carSchema = new Schema({
    name: String,
    updated_at: Date
});

var brandSchema = new Schema({
    name: String,
    updated_at: Date
});

carSchema.pre('save', function(next){
    this.updated_at = new Date();
    next();
});

brandSchema.pre('save', function(next){
    this.updated_at = new Date();
    next();
});

var Car = mongoose.model('Car', carSchema);
var Brand = mongoose.model('Brand', brandSchema);


Car.find({}).remove().exec(function(){
    Brand.find({}).remove().exec(function(){

        for (var i = 0; i < 33; i++){
            (function(){
                var r = Math.floor(Math.random() * 100000);

                Brand.create(
                    [
                        {
                            name: 'BMW',
                            updated_at: new Date()
                        },
                        {
                            name: 'Ford',
                            updated_at: new Date()
                        },
                        {
                            name: 'Other Ford',
                            updated_at: new Date()
                        }
                    ],
                    function(){}
                );

                Car.create(
                    [
                        {
                            name: '325i',
                            updated_at: new Date()
                        },
                        {
                            name: 'Mustang',
                            model: 'Mustang 5.0',
                            updated_at: new Date()
                        },
                        {
                            name: 'Mustang',
                            model: 'Mustang GT',
                            updated_at: new Date()
                        }
                    ],
                    function(){}
                );

            })();
        }
    });
});


module.exports.Car = Car;
module.exports.Brand = Brand;