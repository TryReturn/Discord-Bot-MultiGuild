const mongoose = require('mongoose');
const chalk = require('chalk');

const mongoConfig = {
  IP_ADDRESS: '',
  PORT: 12345,
  USER: '',
  PASSWORD: '',
};

const connectionString = `mongodb://${mongoConfig.USER}:${mongoConfig.PASSWORD}@${mongoConfig.IP_ADDRESS}:${mongoConfig.PORT}`;

async function connectToDatabase() {
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
    });
    console.log(chalk.green(chalk.bold('DATABASE')), chalk.white('>>'), chalk.green('Connected to MongoDB'));
  } catch (error) {
    console.error(chalk.red(chalk.bold('DATABASE')), chalk.white('>>'), chalk.red('[DATABASE ERROR] >> Connection error'));
    console.error(chalk.red('[DATABASE ERROR] >> '), error);
    console.error(chalk.red('[DATABASE ERROR] >> Failed to connect to MongoDB. Trying to create the database...'));

    try {
      await mongoose.createConnection(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000,
      });
      console.log(chalk.green(chalk.bold('DATABASE')), chalk.white('>>'), chalk.green('Created and connected to MongoDB'));
    } catch (createError) {
      console.error(chalk.red('[DATABASE ERROR] >> '), createError);
      console.error(chalk.red('[DATABASE ERROR] >> Failed to create and connect to MongoDB. Please check your configuration.'));
    }
  }
}

connectToDatabase();
