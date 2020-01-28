const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }]
});

module.exports = mongoose.model('User', userSchema);