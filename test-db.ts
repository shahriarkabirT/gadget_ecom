import mongoose from 'mongoose';
import connectDB from './src/lib/db';
import Product from './src/models/Product';

async function test() {
  await connectDB();
  const product = await Product.findOne({ "slug": "natus-aspernatur-rer" });
  console.log(JSON.stringify(product?.variants[0], null, 2));
  process.exit(0);
}
test();
