const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true },
    username: String,
    content: String,
    dateCreated: Date,
    langtag: { type: String, default: 'Undefined' }
});

module.exports = mongoose.model('Note', noteSchema);