const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  name: {
    type: String,
    unique:true,
    required: true,
    trim: true
  },
  location:{
    type:String,
  },
  photo: {
    type: String,
  },
  cphoto:{
    type:String,
    default:"https://i.postimg.cc/SxN3MBcH/not-found.png"
  },

});

const Publication = mongoose.model('Publication', publicationSchema);

module.exports = Publication;
