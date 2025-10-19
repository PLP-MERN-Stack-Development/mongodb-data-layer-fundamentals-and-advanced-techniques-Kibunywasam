
// Script to populate the 'plp_bookstore' database with sample book data using Node.js and MongoDB Driver

require('dotenv').config();

const { MongoClient } = require('mongodb');

// Configuration
const CONFIG = {
  // Use environment variable for connection string in real apps
  MONGODB_ATLAS_URI: process.env.MONGODB_ATLAS_URI,
  DB_NAME: 'plp_bookstore',
  COLLECTION_NAME: 'books',
  DROP_ON_RELOAD: true,
};

//  Sample book data 
const SAMPLE_BOOKS = [
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Fiction',
    published_year: 1960,
    price: 12.99,
    in_stock: true,
    pages: 336,
    publisher: 'J. B. Lippincott & Co.'
  },
  {
    title: '1984',
    author: 'George Orwell',
    genre: 'Dystopian',
    published_year: 1949,
    price: 10.99,
    in_stock: true,
    pages: 328,
    publisher: 'Secker & Warburg'
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Fiction',
    published_year: 1925,
    price: 9.99,
    in_stock: true,
    pages: 180,
    publisher: 'Charles Scribner\'s Sons'
  },
  {
    title: 'Brave New World',
    author: 'Aldous Huxley',
    genre: 'Dystopian',
    published_year: 1932,
    price: 11.50,
    in_stock: false,
    pages: 311,
    publisher: 'Chatto & Windus'
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    genre: 'Fantasy',
    published_year: 1937,
    price: 14.99,
    in_stock: true,
    pages: 310,
    publisher: 'George Allen & Unwin'
  },
  {
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    genre: 'Fiction',
    published_year: 1951,
    price: 8.99,
    in_stock: true,
    pages: 224,
    publisher: 'Little, Brown and Company'
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    genre: 'Romance',
    published_year: 1813,
    price: 7.99,
    in_stock: true,
    pages: 432,
    publisher: 'T. Egerton, Whitehall'
  },
  {
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    genre: 'Fantasy',
    published_year: 1954,
    price: 19.99,
    in_stock: true,
    pages: 1178,
    publisher: 'Allen & Unwin'
  },
  {
    title: 'Animal Farm',
    author: 'George Orwell',
    genre: 'Political Satire',
    published_year: 1945,
    price: 8.50,
    in_stock: false,
    pages: 112,
    publisher: 'Secker & Warburg'
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    genre: 'Fiction',
    published_year: 1988,
    price: 10.99,
    in_stock: true,
    pages: 197,
    publisher: 'HarperOne'
  },
  {
    title: 'Moby Dick',
    author: 'Herman Melville',
    genre: 'Adventure',
    published_year: 1851,
    price: 12.50,
    in_stock: false,
    pages: 635,
    publisher: 'Harper & Brothers'
  },
  {
    title: 'Wuthering Heights',
    author: 'Emily Brontë',
    genre: 'Gothic Fiction',
    published_year: 1847,
    price: 9.99,
    in_stock: true,
    pages: 342,
    publisher: 'Thomas Cautley Newby'
  }
];

// Inserts sample book data into MongoDB
 
async function insertBooks() {
  const client = new MongoClient(CONFIG.MONGODB_ATLAS_URI);

  try {
    console.log(' Connecting to MongoDB...');
    await client.connect();

    const db = client.db(CONFIG.DB_NAME);
    const collection = db.collection(CONFIG.COLLECTION_NAME);

    // Optional: Clear existing data to ensure clean state
    if (CONFIG.DROP_ON_RELOAD) {
      const docCount = await collection.countDocuments();
      if (docCount > 0) {
        console.log(`  Dropping existing '${CONFIG.COLLECTION_NAME}' collection (${docCount} documents)...`);
        await collection.drop();
      }
    }

    // Insert sample books
    console.log('Inserting sample books...');
    const result = await collection.insertMany(SAMPLE_BOOKS, { ordered: true });

    console.log(` Successfully inserted ${result.insertedCount} books into '${CONFIG.DB_NAME}.${CONFIG.COLLECTION_NAME}'`);

    //  Log a preview of inserted data
    const preview = await collection.find().limit(3).toArray();
    console.log('\n Preview of inserted books:');
    preview.forEach((book, i) => {
      console.log(`  ${i + 1}. "${book.title}" by ${book.author} — $${book.price} (${book.in_stock ? 'In Stock' : 'Out of Stock'})`);
    });

  } catch (error) {
    console.error(' Failed to insert books:', error);
    process.exit(1); // Exit with error code for CI/script reliability
  } finally {
    await client.close();
    console.log(' MongoDB connection closed.');
  }
}

// Run the script if called directly
if (require.main === module) {
  insertBooks();
}

// Export for testing or reuse (optional but good practice)
module.exports = { insertBooks, SAMPLE_BOOKS, CONFIG };