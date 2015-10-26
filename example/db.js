var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/minimongoose4');

var Schema = mongoose.Schema;

var brandSchema = new Schema({
    name: String,
    updated_at: Date
});

var carSchema = new Schema({
    name: String,
    brand: { type: Schema.ObjectId , ref: 'Brand' },
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

        Brand.create(
            {
                name: 'BMW'
            },
            function(err, bmw){
                Car.create(
                    {
                        brand: bmw._id,
                        name: '325i'
                    }, function(){}
                );

                Car.create(
                    {
                        brand: bmw._id,
                        name: 'm5'
                    }, function(){}
                );

                Car.create(
                    {
                        brand: bmw._id,
                        name: 'm3'
                    }, function(){}
                );
            }
        );

        Brand.create(
            {
                name: 'Ford'
            },
            function(err, ford){
                Car.create(
                    {
                        brand: ford._id,
                        name: 'Mustang'
                    }, function(){}
                );

                Car.create(
                    {
                        brand: ford._id,
                        name: 'Taurus'
                    }, function(){}
                );

                Car.create(
                    {
                        brand: ford._id,
                        name: 'Focus'
                    }, function(){}
                );
            }
        );
    });
});


module.exports.Car = Car;
module.exports.Brand = Brand;