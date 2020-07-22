const mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    user_id: { type: Number, required: true, unique: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    balance: { type: Number, required: true },
    test_balance: { type: Number, required: true },
    history: { type: Array, required: true },
}, { versionKey: false, timestamps: { createdAt: 'created_at' } })

module.exports = {
    user: mongoose.model('users', UserSchema)
} 
