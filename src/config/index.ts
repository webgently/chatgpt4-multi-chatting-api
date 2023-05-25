require('dotenv').config();

export = {
  mongoURI: `mongodb://127.0.0.1:27017/${process.env.DATABASE_NAME}?serverSelectionTimeoutMS=5000&connectTimeoutMS=10000`
};
