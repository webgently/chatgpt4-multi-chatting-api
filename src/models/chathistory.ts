/** @format */

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Basic Schema
const BasicSchema = new Schema({
  from: {
    type: String,
    default: '',
    require: true
  },
  to: {
    type: String,
    default: '',
    require: true
  },
  message: {
    type: Array,
    default: [],
    require: true
  },
  date: {
    type: Date,
    default: null,
    require: true
  }
});

export default mongoose.model('chathistories', BasicSchema);
