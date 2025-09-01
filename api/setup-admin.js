const bcrypt = require('bcryptjs');
const { pool } = require('./config/database');

async function setupAdmin() {
  try {
    console.log('🔐 Setting up admin user...');
    
    // Check if admin already exists
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE role = $1',
      ['admin']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user
    const adminPassword = 'admin123'; // Change this in production
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, role`,
      ['admin', 'admin@vrportal.com', passwordHash, 'admin']
    );

    const admin = result.rows[0];
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('👤 Username:', admin.name);
    console.log('🔑 Password:', adminPassword);
    console.log('⚠️  Remember to change the password in production!');
    
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
  } finally {
    await pool.end();
  }
}

setupAdmin();

