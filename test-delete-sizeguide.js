require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // insert fake product
    const db = mongoose.connection.db;
    const inserted = await db.collection('products').insertOne({
        title: "Test Size Guide Product",
        slug: "test-size-guide-product",
        sizeGuide: "/uploads/fake-sizeguide.jpg",
        images: ["/uploads/fake-image.jpg"],
        category: new mongoose.Types.ObjectId(),
        stock: 10,
        price: 100
    });
    
    const productId = inserted.insertedId.toString();
    console.log("Created product", productId);
    
    // We don't have Next API running easily here to test the DELETE route with auth.
    // Let's just read it back.
    const product = await db.collection('products').findOne({ _id: inserted.insertedId });
    console.log("Fetched product sizeGuide:", product.sizeGuide);
    
    // Delete it directly
    await db.collection('products').deleteOne({ _id: inserted.insertedId });
    console.log("Cleaned up DB.");
    process.exit(0);
}
main().catch(console.error);
