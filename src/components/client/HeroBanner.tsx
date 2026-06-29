import dbConnect from '@/lib/db';
import Banner from '@/models/Banner';
import HeroBannerClient from './HeroBannerClient';

async function getActiveBanners() {
    await dbConnect();
    const banners = await Banner.find({
        isActive: true,
        position: { $in: ['primary', 'secondary', 'secondary-top', 'secondary-bottom'] },
    })
        .sort({ order: 1 })
        .lean();
    return JSON.parse(JSON.stringify(banners));
}

export default async function HeroBanner() {
    const banners = await getActiveBanners();

    return <HeroBannerClient banners={banners} />;
}
