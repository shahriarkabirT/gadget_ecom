require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");
    
    // We don't have the Product model loaded, let's just use raw collection
    const db = mongoose.connection.db;
    const products = await db.collection('products').find({ sizeGuide: { $exists: true, $ne: "" } }).limit(5).toArray();
    
    if (products.length === 0) {
        console.log("No products found with a size guide.");
    }
    
    for (const p of products) {
        console.log("Product:", p.title);
        console.log("sizeGuide (type):", typeof p.sizeGuide);
        console.log("sizeGuide (value):", p.sizeGuide);
    }
    process.exit(0);
}
main().catch(err => {
    console.error(err);
    process.exit(1);
});
