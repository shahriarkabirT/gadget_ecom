import mongoose from 'mongoose';
import { default as connectDB } from './src/lib/db.js';
import { default as Product } from './src/models/Product.js';

async function test() {
  await connectDB();
  const product = await Product.findOne({ "slug": "natus-aspernatur-rer" });
  console.log(JSON.stringify(product?.variants[0], null, 2));
  process.exit(0);
}
test();
