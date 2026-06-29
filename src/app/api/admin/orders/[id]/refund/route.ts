import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { IOrderDocument, IOrderItem } from '@/types';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const admin = await requirePermission('orders');
        if (!admin || !['admin', 'superadmin'].includes(admin.role)) {
            return NextResponse.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
        }

        const { reason, restock } = await req.json();

        await dbConnect();

        const order = await Order.findById(id).populate('products.productId');
        if (!order) {
            return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }

        // Check if already refunded
        if (order.paymentStatus === 'Refunded' || order.orderStatus === 'Returned') {
            return NextResponse.json({ success: false, message: 'Order is already refunded or returned' }, { status: 400 });
        }

        // Restocking logic
        if (restock) {
            // we will go through each product in the order and increment its stock
            for (const item of order.products) {
                // If the product still exists in db
                const product = await Product.findById(item.productId);
                if (product) {
                    // Update total stock
                    product.stock += item.quantity;
                    // Update sold count
                    product.soldCount = Math.max(0, product.soldCount - item.quantity);

                    // Update variant stock if the item has variant specifically chosen
                    if (item.variant && item.variant._id) {
                        const variantId = item.variant._id.toString();
                        const vIndex = product.variants.findIndex((v: any) => v._id.toString() === variantId);
                        if (vIndex !== -1) {
                            product.variants[vIndex].stock += item.quantity;
                        }
                    }

                    await product.save();
                }
            }
        }

        // Update the order itself
        order.paymentStatus = 'Refunded';
        order.orderStatus = 'Returned';
        order.refundDetails = {
            reason: reason || 'N/A',
            restocked: Boolean(restock),
            refundedAt: new Date()
        };

        await order.save();

        return NextResponse.json({ success: true, order });

    } catch (error: any) {
        console.error('Error processing refund:', error);
        return NextResponse.json({ success: false, message: error?.message || 'Error processing refund' }, { status: 500 });
    }
}
