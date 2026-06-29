import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VariantOption from '@/models/VariantOption';
import { requirePermission } from '@/lib/auth';

// GET all variant options (grouped by type)
export async function GET() {
    try {
        await dbConnect();
        const options = await VariantOption.find({ isActive: true })
            .sort({ order: 1, createdAt: 1 })
            .lean();

        const grouped = {
            sizes: options.filter((o) => o.type === 'size'),
            colors: options.filter((o) => o.type === 'color'),
            materials: options.filter((o) => o.type === 'material'),
            models: options.filter((o) => o.type === 'model'),
        };

        return NextResponse.json({ success: true, ...grouped });
    } catch (error) {
        console.error('Get Variant Options Error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}

// POST create a variant option (admin only)
export async function POST(request: Request) {
    try {
        const admin = await requirePermission('products');
        if (!admin) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { type, label, order, colorCode } = body;

        if (!type || !['size', 'color', 'material', 'model'].includes(type)) {
            return NextResponse.json(
                { success: false, message: 'Valid type (size, color, material, model) is required' },
                { status: 400 }
            );
        }

        if (!label || !label.trim()) {
            return NextResponse.json(
                { success: false, message: 'Label is required' },
                { status: 400 }
            );
        }

        if (type === 'color' && !colorCode) {
            return NextResponse.json(
                { success: false, message: 'Color code is required for color type' },
                { status: 400 }
            );
        }

        await dbConnect();

        const option = await VariantOption.create({
            type,
            label: label.trim(),
            order: order || 0,
            colorCode: type === 'color' ? colorCode : undefined,
        });

        return NextResponse.json({
            success: true,
            message: 'Variant option created',
            option,
        });
    } catch (error: any) {
        console.error('Create Variant Option Error:', error);

        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, message: 'This option already exists' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}
