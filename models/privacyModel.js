// models/PrivacySettings.js
const mongoose = require('mongoose');
 
const privacySettingsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
// models/PrivacySettings.js
 
    profile: { 
        type: String, 
        enum: ['public', 'private', 'friends'], 
        default: 'public' 
    },
    posts: { 
        type: String, 
        enum: ['public', 'private', 'friends'], 
        default: 'public' 
    },
    followers: { 
        type: String, 
        enum: ['public', 'private', 'friends'], 
        default: 'public' 
    },
    following: { 
        type: String, 
        enum: ['public', 'private', 'friends'], 
        default: 'public' 
    },
    likes: { 
        type: String, 
        enum: ['public', 'private', 'friends'], 
        default: 'public' 
    },
    email: { 
        type: String, 
        enum: ['public', 'private', 'friends'], 
        default: 'private' 
    },
    address: { 
        type: String, 
        enum: ['public', 'private', 'friends'], 
        default: 'private' 
    },
    mobile: { 
        type: String, 
        enum: ['public', 'private', 'friends'], 
        default: 'private' 
    }
},  {
    timestamps: true
})

module.exports = mongoose.model('PrivacySettings', privacySettingsSchema);