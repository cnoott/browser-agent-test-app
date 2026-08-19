import bcrypt from 'bcryptjs';
import { initDatabase, dbRun, closeDatabase } from './database.js';

const seedData = async () => {
  try {
    // Initialize database schema
    await initDatabase();

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await dbRun(
      `INSERT OR REPLACE INTO users (username, email, password, role)
       VALUES (?, ?, ?, ?)`,
      ['admin', 'admin@test.com', adminPassword, 'admin']
    );

    // Create test user
    const userPassword = await bcrypt.hash('user123', 10);
    await dbRun(
      `INSERT OR REPLACE INTO users (username, email, password, role)
       VALUES (?, ?, ?, ?)`,
      ['testuser', 'user@test.com', userPassword, 'user']
    );

    // Create sample products
    const products = [
      { name: 'Laptop', description: 'High-performance laptop', price: 999.99, category: 'Electronics', stock: 10 },
      { name: 'Mouse', description: 'Wireless mouse', price: 29.99, category: 'Electronics', stock: 50 },
      { name: 'Book', description: 'Programming book', price: 49.99, category: 'Books', stock: 25 },
      { name: 'Headphones', description: 'Noise-cancelling headphones', price: 199.99, category: 'Electronics', stock: 15 },
      { name: 'Keyboard', description: 'Mechanical keyboard', price: 129.99, category: 'Electronics', stock: 20 }
    ];

    for (const product of products) {
      await dbRun(
        `INSERT OR REPLACE INTO products (name, description, price, category, stock)
         VALUES (?, ?, ?, ?, ?)`,
        [product.name, product.description, product.price, product.category, product.stock]
      );
    }

    // Create test configurations
    const testConfigs = [
      {
        name: 'Slow Loading',
        description: 'Enable slow loading simulation',
        enabled: true,
        settings: JSON.stringify({ delay: 2000, randomFail: 0.1 })
      },
      {
        name: 'Element Movement',
        description: 'Enable element position changes',
        enabled: false,
        settings: JSON.stringify({ moveInterval: 5000, distance: 10 })
      },
      {
        name: 'Network Errors',
        description: 'Simulate network failures',
        enabled: false,
        settings: JSON.stringify({ failureRate: 0.2, timeoutMs: 5000 })
      }
    ];

    for (const config of testConfigs) {
      await dbRun(
        `INSERT OR REPLACE INTO test_configurations (name, description, enabled, settings)
         VALUES (?, ?, ?, ?)`,
        [config.name, config.description, config.enabled, config.settings]
      );
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    closeDatabase();
  }
};

seedData();