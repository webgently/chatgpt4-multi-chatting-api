/** @format */

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Basic Schema
const BasicSchema = new Schema({
    speaker: {
        type: String,
        default: '',
        require: true
    },
    time: {
        type: Date,
        default: '',
        require: true
    },
    vector: {
        type: Array,
        default: [],
        require: true
    },
    message: {
        type: Array,
        default: [],
        require: true
    },
    uuid: {
        type: String,
        default: '',
        require: true
    },
    timestring: {
        type: String,
        default: '',
        require:true
    }
});

export default mongoose.model('nexus', BasicSchema);
