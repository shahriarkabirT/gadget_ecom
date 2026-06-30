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

const Product = mongoose.model('TestProduct', ProductSchema);
const p = new Product({ variants: [{ attributes: { size: 'XL', color: 'Red' } }] });
console.log(JSON.stringify(p.toJSON()));
