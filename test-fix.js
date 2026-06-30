import mongoose from 'mongoose';
import { default as connectDB } from './src/lib/db.js';
import { default as Product } from './src/models/Product.js';

async function test() {
  await connectDB();
  const product = await Product.findOne({ "slug": "natus-aspernatur-rer" });
  if (product && product.variants.length > 0) {
     product.variants[0].attributes = { "size": "XL", "color": "Red" };
     await product.save();
     console.log("Saved test data to DB.");
  }
  process.exit(0);
}
test();
