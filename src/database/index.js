const mongoose = require("mongoose");

const db_url = "mongodb+srv://meetsn:meetsn@cluster0.keolo.mongodb.net/?retryWrites=true&w=majority";

module.exports = initializeDatabase = () => {
  mongoose
    .connect(db_url)
    .then(res => console.log('Database is connected'))
    .catch(err => console.log(err));
};
