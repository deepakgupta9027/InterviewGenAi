const mongoose = require('mongoose');
require('dotenv').config();


async function dbConnect(){
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("connected to database");
    }catch(err){
        console.log(err);
    }
}

module.exports = dbConnect;