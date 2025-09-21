const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

  console.log(`MongoDB Connected: ${conn.connection.host}`);
} catch (error) {
  console.error('Database connection error:', error);
  process.exit(1);
}
};


process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = connectDB;