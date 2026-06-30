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

const Product = mongoose.model('TestProduct4', ProductSchema);

async function test() {
   const p = new Product({ variants: [{ attributes: { size: 'XL', color: 'Red' } }] });
   const obj = p.toObject();
   console.log("Without flattenMaps:", JSON.stringify(obj));
   const obj2 = p.toObject({ flattenMaps: true });
   console.log("With flattenMaps:", JSON.stringify(obj2));
   
   console.log("Is Map?", obj.variants[0].attributes instanceof Map);
   process.exit(0);
}
test();
