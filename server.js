const { app } = require('./app');

// Models
const { initModels } = require('./models/initModels');

// Utils
const { db } = require('./utils/database');

// Authenticate database credentials
db.authenticate()
  .then(() => console.log('Database successfully contected and authenticated'))
  .catch(err => console.log(err));

// Establish models relations
initModels();

// Sync sequelize models
db.sync()
  .then(() => console.log('Database successfully synced'))
  .catch(err => console.log(err));

// Spin up server
const PORT = process.env.PORT || 4015;

app.listen(PORT, () => {
  if (process.env.NODE_ENV === 'production') {
    console.log(`Express server running in production mode on port ${PORT}`);
  } else if (process.env.NODE_ENV === 'development') {
    console.log(
      `Express server running in development mode on http://localhost:${PORT}`
    );
  }
});
