import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    variants: [{
        attributes: {
            type: Map,
            of: String,
            default: {}
        }
    }]
}, { strict: true });

const Product = mongoose.model('TestProduct3', ProductSchema);

async function test() {
   await mongoose.connect('mongodb://localhost:27017/gadget_ecom_test');
   const p = new Product();
   p.variants = [{ attributes: { size: 'XL', color: 'Red' } }];
   await p.save();
   
   const doc = await Product.findById(p._id);
   console.log("From DB:", JSON.stringify(doc.toJSON()));
   process.exit(0);
}
test();
