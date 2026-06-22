const bcrypt = require('bcryptjs');

const hash = '$2a$10$EIXJg9Yd8KbVl0iKh0N5hOLAu3jHw6ZP7gNYvO0tB7F8h7xHp8Y9K';
const passwords = ['Admin@123', 'admin123', 'Admin123!', 'password', 'mysticjewel', 'Admin@1234', 'Mystic@123'];

async function run() {
  for (const p of passwords) {
    const match = await bcrypt.compare(p, hash);
    console.log(`"${p}" -> ${match}`);
  }
  // Generate a new hash for Admin@123 so we can update the DB
  const newHash = await bcrypt.hash('Admin@123', 10);
  console.log('\nNew hash for Admin@123:');
  console.log(newHash);
}

run();
