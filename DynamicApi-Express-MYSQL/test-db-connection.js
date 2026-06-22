const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('\n🔍 Testing Database Connection...\n');
    console.log('Connection Details:');
    console.log(`  Host: ${process.env.DB_HOST}`);
    console.log(`  Port: ${process.env.DB_PORT}`);
    console.log(`  User: ${process.env.DB_USER}`);
    console.log(`  Database: ${process.env.DB_NAME}\n`);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Database connection successful!\n');

    // Test if stored procedures exist
    console.log('🔍 Checking for stored procedures...\n');

    const [procedures] = await connection.execute(
      `SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'`,
      [process.env.DB_NAME]
    );

    console.log(`Found ${procedures.length} stored procedures:\n`);

    const requiredProcedures = [
      'SP_GetCart', 'SP_GetWishlist', 'SP_GetCategories',
      'SP_GetProducts', 'SP_GetOrders', 'SP_CreateOrder',
      'SP_AddCartItem', 'SP_UpdateCartItem', 'SP_RemoveCartItem'
    ];

    const procedureNames = procedures.map(p => p.ROUTINE_NAME);
    let foundCount = 0;
    let missingCount = 0;

    requiredProcedures.forEach(proc => {
      if (procedureNames.includes(proc)) {
        console.log(`  ✅ ${proc}`);
        foundCount++;
      } else {
        console.log(`  ❌ ${proc} (MISSING)`);
        missingCount++;
      }
    });

    console.log(`\n📊 Summary: ${foundCount} found, ${missingCount} missing\n`);

    // Show all procedures
    console.log('All procedures in database:');
    procedureNames.slice(0, 10).forEach(name => {
      console.log(`  • ${name}`);
    });
    if (procedureNames.length > 10) {
      console.log(`  ... and ${procedureNames.length - 10} more\n`);
    }

    await connection.end();

    if (missingCount > 0) {
      console.log('⚠️  Some procedures are missing. Run complete_schema.sql to deploy them.');
      process.exit(1);
    } else {
      console.log('✅ All required procedures are deployed!');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Database connection failed!\n');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure MySQL is running');
    console.error('2. Check credentials in .env file');
    console.error('3. Verify database name exists');
    console.error('4. Check firewall settings\n');
    process.exit(1);
  }
}

testConnection();
