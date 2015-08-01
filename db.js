var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/minimongoose4');

var Schema = mongoose.Schema;

var carSchema = new Schema({
    name: String,
    brand_id: {type: mongoose.Schema.ObjectId },
    brand: {type: mongoose.Schema.ObjectId, ref: 'Brand'},
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
        new Brand({ name: 'BMW' })
        .save()
        .then(function(brand){
            new Car({
                name: '325i',
                brand: brand._id,
                brand_id: brand._id
            })
            .save()
        });        
    });
    
});


module.exports.Car = Car;
module.exports.Brand = Brand;