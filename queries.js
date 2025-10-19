
// MongoDB queries for PLP Week 1 assignment — implemented in Node.js

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_ATLAS_URI = process.env.MONGODB_ATLAS_URI;
const DB_NAME = 'plp_bookstore';
const COLLECTION_NAME = 'books';

if (!MONGODB_ATLAS_URI) {
  console.error('ERROR: MONGODB_ATLAS_URI is not set in environment variables.');
  console.error('   --> Create a .env file with your MongoDB connection string.');
  process.exit(1);
}

async function runAllQueries() {
  const client = new MongoClient(MONGODB_ATLAS_URI);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    const db = client.db(DB_NAME);
    const books = db.collection(COLLECTION_NAME);


    // Task 2: Basic CRUD Operations
  

    console.log('\n=== Task 2: Basic CRUD ===');

    // 1. Find all books in a specific genre (e.g., "Fantasy")
    console.log('\n1. Books in "Fantasy" genre:');
    const fantasyBooks = await books.find({ genre: 'Fantasy' }).toArray();
    fantasyBooks.forEach(b => console.log(`   - ${b.title} (${b.published_year})`));

    // 2. Find books published after a certain year (e.g., 1950)
    console.log('\n2. Books published after 1950:');
    const recentBooks = await books.find({ published_year: { $gt: 1950 } }).toArray();
    recentBooks.forEach(b => console.log(`   - ${b.title} (${b.published_year})`));

    // 3. Find books by a specific author (e.g., "George Orwell")
    console.log('\n3. Books by George Orwell:');
    const orwellBooks = await books.find({ author: 'George Orwell' }).toArray();
    orwellBooks.forEach(b => console.log(`   - ${b.title}`));

    // 4. Update the price of a specific book (e.g., "1984")
    console.log('\n4. Updating price of "1984" to $14.99...');
    const updateResult = await books.updateOne(
      { title: '1984' },
      { $set: { price: 14.99 } }
    );
    console.log(`   --> Modified ${updateResult.modifiedCount} document(s)`);

    // 5. Delete a book by title (e.g., "The Alchemist")
    console.log('\n5. Deleting "The Alchemist"...');
    const deleteResult = await books.deleteOne({ title: 'The Alchemist' });
    console.log(`   --> Deleted ${deleteResult.deletedCount} book(s)`);


    // Task 3: Advanced Queries


    console.log('\n=== Task 3: Advanced Queries ===');

    // 6. Books in stock AND published after 2010
    console.log('\n6. In-stock books published after 2010:');
    const inStockRecent = await books.find({
      in_stock: true,
      published_year: { $gt: 2010 }
    }).toArray();
    if (inStockRecent.length === 0) {
      console.log('   --> None found (expected, since all sample books are pre-2010)');
    } else {
      inStockRecent.forEach(b => console.log(`   - ${b.title}`));
    }

    // 7. Projection: only title, author, price
    console.log('\n7. Projected fields (title, author, price):');
    const projected = await books.find(
      {},
      { projection: { _id: 0, title: 1, author: 1, price: 1 } }
    ).limit(5).toArray();
    projected.forEach(b => console.log(`   - "${b.title}" by ${b.author} --> $${b.price}`));

    // 8. Sorting by price (ascending & descending)
    console.log('\n8. Books sorted by price (ascending):');
    const asc = await books.find().sort({ price: 1 }).limit(3).toArray();
    asc.forEach(b => console.log(`   - ${b.title}: $${b.price}`));

    console.log('   Books sorted by price (descending):');
    const desc = await books.find().sort({ price: -1 }).limit(3).toArray();
    desc.forEach(b => console.log(`   - ${b.title}: $${b.price}`));

    // 9. Pagination: 5 books per page (Page 1 and Page 2)
    console.log('\n9. Pagination (5 per page):');
    const page1 = await books.find().skip(0).limit(5).toArray();
    const page2 = await books.find().skip(5).limit(5).toArray();
    console.log('   --> Page 1:', page1.map(b => b.title));
    console.log('   --> Page 2:', page2.map(b => b.title));


    // Task 4: Aggregation Pipeline

    console.log('\n=== Task 4: Aggregation ===');

    // 10. Average price by genre
    console.log('\n10. Average price by genre:');
    const avgByGenre = await books.aggregate([
      { $group: { _id: '$genre', avgPrice: { $avg: '$price' } } },
      { $sort: { avgPrice: -1 } }
    ]).toArray();
    avgByGenre.forEach(g => console.log(`   - ${g._id}: $${g.avgPrice.toFixed(2)}`));

    // 11. Author with the most books
    console.log('\n11. Author with the most books:');
    const topAuthor = await books.aggregate([
      { $group: { _id: '$author', bookCount: { $sum: 1 } } },
      { $sort: { bookCount: -1 } },
      { $limit: 1 }
    ]).toArray();
    if (topAuthor.length > 0) {
      console.log(`   - ${topAuthor[0]._id} (${topAuthor[0].bookCount} books)`);
    }

    // 12. Group by publication decade
    console.log('\n12. Books grouped by decade:');
    const byDecade = await books.aggregate([
      {
        $addFields: {
          decade: { $concat: [{ $toString: { $multiply: [{ $floor: { $divide: ['$published_year', 10] } }, 10] } }, 's'] }
        }
      },
      { $group: { _id: '$decade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    byDecade.forEach(d => console.log(`   - ${d._id}: ${d.count} book(s)`));


    // Task 5: Indexing and explain()

    console.log('\n=== Task 5: Indexing ===');

    // 13. Create indexes
    console.log('\n13. Creating indexes...');
    await books.createIndex({ title: 1 });
    await books.createIndex({ author: 1, published_year: 1 });
    console.log('   --> Created index on "title"');
    console.log('   --> Created compound index on "author, published_year"');

    // 14. Demonstrate explain() — show execution stats
    console.log('\n14. Running explain() on title query:');
    const explainOutput = await books.find({ title: '1984' }).explain('executionStats');
    const executionStages = explainOutput.executionStats.executionStages;

    if (executionStages.stage === 'IXSCAN') {
      console.log('   --> Index used (IXSCAN detected) -- performance optimized!');
    } else {
      console.log('   --> Index not used (COLLSCAN) -- check index creation.');
    }

    console.log(`   --> Total docs examined: ${executionStages.docsExamined}`);
    console.log(`   --> Execution time (ms): ${explainOutput.executionStats.executionTimeMillis}`);

    console.log('\nAll queries completed successfully!');

  } catch (err) {
    console.error('Query error:', err.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed.');
  }
}

// Run only if called directly
if (require.main === module) {
  runAllQueries();
}

module.exports = { runAllQueries };