require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    const products = await db.collection('products').find({ sizeGuide: { $exists: true, $ne: "" } }).sort({createdAt: -1}).limit(5).toArray();
    
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
main().catch(console.error);
