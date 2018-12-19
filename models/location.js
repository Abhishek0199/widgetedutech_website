//Require Mongoose
var mongoose = require('mongoose');

//Define a Schema
var Schema = mongoose.Schema;

var locationSchema = new Schema(
  {
    area: {type: String, required: true},
    city: {type: String, required: true},
    state: {type: String, enum: ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chattisgarh',
    'Goa', 'Gujrat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharastra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
    'Chandigarh', 'Dadar and Nagar Haveli', 'Daman and Diu', 'Delhi', 'Lakshadweep', 'Puducherry (Pondicherry)'], required: true},
    country: {type: String, enum: ['India'], required: true}
  }
);

//export location model
module.exports = mongoose.model('location', locationSchema);
