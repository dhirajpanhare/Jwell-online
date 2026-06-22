/**
 * Fix admin user password and ensure email is verified
 * Run once: node fix_admin.js
 * Admin credentials after fix: admin@mysticjewel.com / Admin@123
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function fix() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'adaahjwels',
  });

  try {
    const password = 'Admin@123';
    const hash = await bcrypt.hash(password, 10);

    // Update admin user
    const [result] = await connection.query(
      `UPDATE Users
       SET PasswordHash = ?, IsEmailVerified = TRUE, Status = 'active'
       WHERE Email = 'admin@mysticjewel.com'`,
      [hash]
    );

    if (result.affectedRows === 0) {
      // Insert if doesn't exist
      await connection.query(
        `INSERT INTO Users (Email, PasswordHash, FirstName, LastName, IsEmailVerified, Status, Role)
         VALUES ('admin@mysticjewel.com', ?, 'Admin', 'User', TRUE, 'active', 'admin')`,
        [hash]
      );
      console.log('Admin user created.');
    } else {
      console.log('Admin user password updated.');
    }

    console.log('Email: admin@mysticjewel.com');
    console.log('Password: Admin@123');

    // Verify it works
    const [users] = await connection.query(
      'SELECT UserId, Email, PasswordHash, IsEmailVerified, Status, Role FROM Users WHERE Email = ?',
      ['admin@mysticjewel.com']
    );

    const user = users[0];
    const valid = await bcrypt.compare(password, user.PasswordHash);
    console.log('\nVerification:');
    console.log('  Password matches hash:', valid);
    console.log('  IsEmailVerified:', !!user.IsEmailVerified);
    console.log('  Status:', user.Status);
    console.log('  Role:', user.Role);

  } finally {
    await connection.end();
  }
}

fix().catch(console.error);
