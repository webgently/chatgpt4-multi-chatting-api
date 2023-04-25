require('dotenv').config();

export = {
  mongoURI: `mongodb://localhost:27017/${process.env.DATABASE_NAME}?serverSelectionTimeoutMS=5000&connectTimeoutMS=10000`
};
