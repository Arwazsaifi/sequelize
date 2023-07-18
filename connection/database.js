const { Sequelize } = require('sequelize');

require('dotenv').config();
const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dialect: 'mysql',
  dialectModule:require('mysql2'),
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connected..');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

  sequelize.sync()
  .then(()=>{
    console.log('tables created in database');
  })
  .catch((error)=>{
    console.log('failed to create tables',error)
  })

module.exports = sequelize;
