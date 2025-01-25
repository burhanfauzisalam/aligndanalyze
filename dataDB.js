const { queryDatabase } = require("./db");

const createDataTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS data (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      customID varchar(50) DEFAULT NULL,
      data INT DEFAULT NULL,
      time datetime DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    // Menjalankan query untuk membuat tabel
    await queryDatabase(sql);
    console.log("Table 'data' created successfully or already exists.");
  } catch (err) {
    console.error("Error creating table: ", err);
  }
};

module.exports = createDataTable;
