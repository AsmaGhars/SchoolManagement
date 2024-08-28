const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI

mongoose.connect(MONGO_URI)
  .then(
    ()=>{
        console.log('DataBase Connected');
    }
  )
  .catch(
    (err)=>{
        console.log(err);
    }
  )

  module.exports = mongoose;