/** @format */

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Basic Schema
const BasicSchema = new Schema({
  first_name: {
    type: String,
    default: '',
    require: true
  },
  last_name: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: '',
    require: true
  },
  user_name: {
    type: String,
    default: '',
    require: true
  },
  avatar: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    default: '',
    require: true
  },
  permission: {
    type: String,
    default: '',
    require: true
  },
  status: {
    type: String,
    default: '',
    require: true
  }
});

export default mongoose.model('users', BasicSchema);
