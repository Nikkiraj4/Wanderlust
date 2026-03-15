const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
});

// If passportLocalMongoose is an object, we use its default export
// This line handles both cases (function or object)
const plugin = typeof passportLocalMongoose === 'function' 
               ? passportLocalMongoose 
               : passportLocalMongoose.default;

userSchema.plugin(plugin);

module.exports = mongoose.model('User', userSchema);