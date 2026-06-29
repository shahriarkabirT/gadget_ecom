import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import ChildCategory from '@/models/ChildCategory';
import SubChildCategory from '@/models/SubChildCategory';
import '@/models/Brand';
import { slugify } from '@/lib/utils';
import { requirePermission } from '@/lib/auth';
import rateLimit from '@/lib/rate-limit';

function parseOptionalProductCost(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return undefined;
    return Math.round(n * 100) / 100;
}

const limiter = rateLimit({
    uniqueTokenPerInterval: 500,
    interval: 10000, // 10 seconds
});

// GET all products
export async function GET(request: any) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || '127.0.0.1';
        try {
            await limiter.check(100, ip); // Limit to 100 requests per 10s per IP
        } catch {
            return NextResponse.json({ success: false, message: 'Too many requests. Please try again later.' }, { status: 429 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const ids = searchParams.get('ids');
        const activeQuery = searchParams.get('active');
        const activeOnly = activeQuery !== 'false' && activeQuery !== 'all';
        const page = parseInt(searchParams.get('page') || '1') || 1;
        const limit = parseInt(searchParams.get('limit') || '12') || 12;
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
        const featured = searchParams.get('featured');

        const query: Record<string, unknown> = {};

        if (activeOnly) {
            query.isActive = true;
        } else if (activeQuery === 'false') {
            query.isActive = false;
        }

        if (ids) {
            query._id = { $in: ids.split(',') };
        }

        if (featured === 'true') {
            query.isFeatured = true;
        } else if (featured === 'false') {
            query.isFeatured = false;
        }

        if (category) {
            // Check if it's an ID or a slug
            let targetCategory: any = null;
            let level = 0; // 0: Category, 1: Sub, 2: Child, 3: SubChild

            if (category.match(/^[0-9a-fA-F]{24}$/)) {
                // Try Category ID
                targetCategory = await Category.findById(category);
                if (!targetCategory) {
                    targetCategory = await SubCategory.findById(category);
                    level = 1;
                }
                if (!targetCategory) {
                    targetCategory = await ChildCategory.findById(category);
                    level = 2;
                }
                if (!targetCategory) {
                    targetCategory = await SubChildCategory.findById(category);
                    level = 3;
                }
            } else {
                // Try slugs across all levels
                targetCategory = await Category.findOne({ slug: category });
                if (!targetCategory) {
                    targetCategory = await SubCategory.findOne({ slug: category });
                    level = 1;
                }
                if (!targetCategory) {
                    targetCategory = await ChildCategory.findOne({ slug: category });
                    level = 2;
                }
                if (!targetCategory) {
                    targetCategory = await SubChildCategory.findOne({ slug: category });
                    level = 3;
                }
            }

            if (targetCategory) {
                const targetId = targetCategory._id;

                if (level === 0) {
                    // Level 0: Top level category
                    // Include the category itself and all its descendant categories (subs, childs, etc.)
                    // Actually, products have subCategory, childCategory, subChildCategory fields.
                    // If we filter by top level, we might want to find products where `category` matches.
                    // The previous logic used 'ancestors', but our models use direct parent fields.

                    // Actually, the most robust way is to find all sub-categories of this category,
                    // all child-categories of those sub-categories, etc. 
                    // OR we just find all products that have this category as their main category.
                    // Given the Product model has all 4 fields, let's just use the appropriate field based on level.
                    query.category = targetId;
                } else if (level === 1) {
                    query.subCategory = targetId;
                } else if (level === 2) {
                    query.childCategory = targetId;
                } else if (level === 3) {
                    query.subChildCategory = targetId;
                }
            } else {
                query.category = null;
            }
        }


        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } },
                { 'variants.size': { $regex: search, $options: 'i' } },
                { 'variants.material': { $regex: search, $options: 'i' } },
                { 'variants.model': { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { 'variants.sku': { $regex: search, $options: 'i' } },
            ];
        }

        // Filtering by variants
        const size = searchParams.get('size');
        const color = searchParams.get('color');
        const material = searchParams.get('material');
        const model = searchParams.get('model');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        if (size) query['variants.size'] = size;
        if (color) query['variants.color'] = color;
        if (material) query['variants.material'] = material;
        if (model) query['variants.model'] = model;

        // Filter by brand
        const brand = searchParams.get('brand');
        if (brand) query.brand = brand;

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) (query.price as any).$gte = Number(minPrice);
            if (maxPrice) (query.price as any).$lte = Number(maxPrice);
        }

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('category', 'name slug')
                .populate('brand', 'name slug logo')
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get Products Error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}

// POST create product (admin only)
export async function POST(request) {
    try {
        const admin = await requirePermission('products');
        if (!admin) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            title,
            mrp,
            price,
            discountType,
            discountValue,
            tax,
            stock,
            weight,
            images,
            category,
            subCategory,
            childCategory,
            subChildCategory,
            brand,
            shortDescription,
            fullDescription,
            sizeGuide,
            variants,
            tags,
            seoMetadata,
            freeShipping,
            preorder,
            sku,
            productType,
            isFeatured,
            productCost,
        } = body;

        // Validation Logic
        if (!title || title.trim().length < 3) {
            return NextResponse.json(
                { success: false, message: 'Product title must be at least 3 characters long' },
                { status: 400 }
            );
        }

        if (mrp === undefined || Number(mrp) < 0) {
            return NextResponse.json(
                { success: false, message: 'Valid MRP is required' },
                { status: 400 }
            );
        }

        if (price === undefined || Number(price) < 1) {
            return NextResponse.json(
                { success: false, message: 'Selling price must be at least 1' },
                { status: 400 }
            );
        }

        if (Number(price) > Number(mrp)) {
            return NextResponse.json(
                { success: false, message: 'Selling price cannot be greater than MRP' },
                { status: 400 }
            );
        }

        if (!category) {
            return NextResponse.json(
                { success: false, message: 'Product category is required' },
                { status: 400 }
            );
        }

        const validImages = (images || []).filter((img: string) => img.trim());
        if (validImages.length === 0) {
            return NextResponse.json(
                { success: false, message: 'At least one product image is required' },
                { status: 400 }
            );
        }

        // Variant validation
        if (variants && Array.isArray(variants)) {
            for (const v of variants) {
                if (Number(v.stock) < 0) {
                    return NextResponse.json(
                        { success: false, message: 'Variant stock cannot be negative' },
                        { status: 400 }
                    );
                }
                if (v.price !== undefined && Number(v.price) < 1) {
                    return NextResponse.json(
                        { success: false, message: 'Variant selling price must be at least 1' },
                        { status: 400 }
                    );
                }
                const vpc = v.productCost;
                if (vpc !== undefined && vpc !== null && vpc !== '' && Number(vpc) < 0) {
                    return NextResponse.json(
                        { success: false, message: 'Variant product cost cannot be negative' },
                        { status: 400 }
                    );
                }
            }
        }

        await dbConnect();

        // Generate unique slug
        let slug = slugify(title);
        let existing = await Product.findOne({ slug });
        let counter = 1;
        while (existing) {
            slug = `${slugify(title)}-${counter}`;
            existing = await Product.findOne({ slug });
            counter++;
        }

        // Sanitize variant _ids: remove empty/invalid _id so Mongoose auto-generates them
        const sanitizedVariants = (variants || []).map((v: any) => {
            const { _id, ...rest } = v;
            const raw = _id && typeof _id === 'string' && _id.match(/^[0-9a-fA-F]{24}$/) ? { _id, ...rest } : { ...rest };
            const pc = parseOptionalProductCost(raw.productCost);
            const { productCost: _drop, ...noPc } = raw;
            return pc !== undefined ? { ...noPc, productCost: pc } : noPc;
        });

        const parsedProductCost = parseOptionalProductCost(productCost);

        const product = await Product.create({
            title,
            slug,
            mrp: Number(mrp),
            price: Number(price),
            discountType,
            discountValue: Number(discountValue) || 0,
            tax: Number(tax) || 0,
            stock: Number(stock) || 0,
            weight: weight !== undefined && weight !== null && weight !== '' ? Number(weight) : null,
            images: images || [],
            category,
            subCategory,
            childCategory,
            subChildCategory,
            brand: brand || undefined,
            shortDescription,
            fullDescription,
            sizeGuide: sizeGuide || undefined,
            variants: sanitizedVariants,
            sku,
            tags: tags || [],
            seoMetadata: seoMetadata || {},
            freeShipping: !!freeShipping,
            preorder: !!preorder,
            productType,
            isFeatured: !!isFeatured,
            ...(parsedProductCost !== undefined ? { productCost: parsedProductCost } : {}),
        });

        await product.populate('category', 'name slug');
        await product.populate('brand', 'name slug logo');

        revalidatePath('/');

        return NextResponse.json({
            success: true,
            message: 'Product created successfully',
            product,
        });
    } catch (error: any) {
        console.error('Create Product Error:', error);
        const message = error.name === 'ValidationError'
            ? error.message
            : 'Server error';
        return NextResponse.json(
            { success: false, message },
            { status: error.name === 'ValidationError' ? 400 : 500 }
        );
    }
}
