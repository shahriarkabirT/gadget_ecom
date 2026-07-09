import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { consignment_id, delivery_status, tracking_code } = body;

        // Steadfast might use consignment_id or tracking_code
        const searchId = consignment_id || tracking_code;

        if (!searchId || !delivery_status) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        const order = await Order.findOne({ 'paymentDetails.trackingId': searchId.toString() });

        if (!order) {
            return NextResponse.json({ success: false, message: 'Order not found for this tracking ID' }, { status: 404 });
        }

        let updated = false;
        const statusStr = delivery_status.toString().toLowerCase();

        if (statusStr.includes('delivered') && !statusStr.includes('approval_pending')) {
            if (order.orderStatus !== 'Delivered') {
                order.orderStatus = 'Delivered';
                if (order.paymentMethod === 'COD') {
                    order.paymentStatus = 'Paid';
                }
                updated = true;
            }
        } else if (statusStr.includes('cancelled') && !statusStr.includes('approval_pending')) {
            if (order.orderStatus !== 'Cancelled') {
                order.orderStatus = 'Cancelled';
                order.paymentStatus = 'Failed';
                updated = true;
            }
        }

        if (updated) {
            await order.save();
        }

        return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
    } catch (error) {
        console.error('Steadfast webhook error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
