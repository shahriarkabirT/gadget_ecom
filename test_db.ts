import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import dbConnect from './src/lib/db';
import Product from './src/models/Product';
async function test() {
    await dbConnect();
    const products = await Product.find().limit(10).select('title _id slug');
    console.log(products);
    process.exit(0);
}
test();
