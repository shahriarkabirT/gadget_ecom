'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useGetApprovedReviewsQuery, useSubmitReviewMutation } from '@/redux/features/reviews/reviewApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const REVIEWS_PER_PAGE = 2;

interface ProductTabsSectionProps {
    product: any;
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button" onClick={() => onChange(star)} className="cursor-pointer">
                    <svg className={`w-7 h-7 ${star <= value ? 'text-yellow-400 fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
        </div>
    );
}

function RatingBreakdown({ reviews }: { reviews: any[] }) {
    const total = reviews.length;
    const avg = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    const recommended = total > 0 ? Math.round((reviews.filter(r => r.rating >= 4).length / total) * 100) : 0;

    const countForStar = (star: number) => reviews.filter(r => r.rating === star).length;

    return (
        <div className="space-y-4">
            <div className="text-center pb-4 border-b border-gray-100">
                <div className="text-6xl font-black text-gray-900">{avg.toFixed(1)}</div>
                <div className="flex justify-center gap-1 my-2">
                    {[1, 2, 3, 4, 5].map(s => (
                        <svg key={s} className={`w-4 h-4 ${s <= Math.round(avg) ? 'text-yellow-400 fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                </div>
                <p className="text-xs text-gray-500">{recommended}% Recommended ({total} reviews)</p>
            </div>

            <div className="space-y-2.5">
                {[5, 4, 3, 2, 1].map(star => {
                    const count = countForStar(star);
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                        <div key={star} className="flex items-center gap-2 text-sm">
                            <div className="w-20 flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <svg
                                        key={s}
                                        className={`w-3.5 h-3.5 ${s <= star ? 'text-yellow-400 fill-current' : 'text-gray-200 fill-current'}`}
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-6 text-gray-400">{pct}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function ProductTabsSection({ product }: ProductTabsSectionProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reviewImages, setReviewImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const descriptionRef = useRef<HTMLDivElement | null>(null);
    const reviewsRef = useRef<HTMLDivElement | null>(null);
    const [reviewPage, setReviewPage] = useState(0);

    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { data: reviewsData, isLoading: isReviewsLoading } = useGetApprovedReviewsQuery(product._id);
    const [submitReview, { isLoading: isSubmitting }] = useSubmitReviewMutation();

    const reviews = reviewsData?.reviews || [];
    const totalReviewPages = Math.max(1, Math.ceil(reviews.length / REVIEWS_PER_PAGE));
    const paginatedReviews = reviews.slice(
        reviewPage * REVIEWS_PER_PAGE,
        reviewPage * REVIEWS_PER_PAGE + REVIEWS_PER_PAGE
    );

    useEffect(() => {
        setReviewPage(0);
    }, [product._id, reviews.length]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length || reviewImages.length + files.length > 5) {
            toast.error('Max 5 images allowed');
            return;
        }
        setIsUploading(true);
        try {
            const urls = await Promise.all(files.map(async file => {
                const fd = new FormData();
                fd.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: fd });
                const data = await res.json();
                if (!data.success) throw new Error(data.message);
                return data.imageUrl;
            }));
            setReviewImages(prev => [...prev, ...urls]);
            toast.success('Images uploaded');
        } catch (e: any) {
            toast.error(e.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) { toast.error('Please login to review'); router.push('/login'); return; }
        if (!comment.trim()) { toast.error('Please enter a comment'); return; }
        try {
            await submitReview({ productId: product._id, rating, comment, images: reviewImages }).unwrap();
            toast.success('Review submitted! It will appear after approval.');
            setRating(5); setComment(''); setReviewImages([]);
        } catch (e: any) {
            toast.error(e.data?.message || 'Submission failed');
        }
    };

    const tabs = [
        { key: 'description', label: 'Description' },
        { key: 'reviews', label: `Customer Reviews (${reviews.length})` },
    ] as const;

    const scrollToSection = (tab: 'description' | 'reviews') => {
        setActiveTab(tab);
        const target = tab === 'description' ? descriptionRef.current : reviewsRef.current;
        if (!target) return;

        const navOffset = 120;
        const top = target.getBoundingClientRect().top + window.scrollY - navOffset;
        window.scrollTo({ top, behavior: 'smooth' });
    };

    useEffect(() => {
        const onScroll = () => {
            if (!descriptionRef.current || !reviewsRef.current) return;

            const threshold = 160;
            const reviewsTop = reviewsRef.current.getBoundingClientRect().top;
            setActiveTab(reviewsTop <= threshold ? 'reviews' : 'description');
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="mt-8 border-t border-gray-100">
            {/* Tab Bar */}
            <div className="flex border-b border-gray-200">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => scrollToSection(tab.key)}
                        className={`px-5 py-3.5 text-xs font-black uppercase tracking-widest transition-colors border-b-2 -mb-px cursor-pointer ${
                            activeTab === tab.key
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Description Section */}
            <div ref={descriptionRef} className="py-8 max-w-4xl">
                    <div
                        className="prose prose-slate max-w-none rich-text-content text-sm"
                        dangerouslySetInnerHTML={{ __html: product.fullDescription || product.shortDescription || '' }}
                    />
                    {product.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
                            {product.tags.map((tag: string) => (
                                <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold rounded border border-gray-100">#{tag}</span>
                            ))}
                        </div>
                    )}
            </div>

            {/* Reviews Section */}
            <div ref={reviewsRef} className="py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left: Rating breakdown */}
                        <div className="md:col-span-1 md:pr-6">
                            <RatingBreakdown reviews={reviews} />

                            {/* Existing Reviews */}
                            {isReviewsLoading ? (
                                <div className="mt-6 space-y-3">
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i} className="animate-pulse p-4 border border-gray-100 rounded">
                                            <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
                                            <div className="h-3 bg-gray-100 rounded w-full" />
                                        </div>
                                    ))}
                                </div>
                            ) : reviews.length > 0 ? (
                                <div className="mt-6 space-y-4">
                                    {paginatedReviews.map((review: any) => (
                                        <div key={review._id} className="p-4 bg-gray-50 rounded border border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-black text-xs">
                                                        {review.userId?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-800">{review.userId?.name || 'Anonymous'}</span>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <svg key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-700 leading-relaxed">{review.comment}</p>
                                            {review.images?.length > 0 && (
                                                <div className="flex gap-2 mt-3 flex-wrap">
                                                    {review.images.map((img: string, idx: number) => (
                                                        <div key={idx} className="relative w-14 h-14 rounded border border-gray-200 overflow-hidden">
                                                            <Image src={img} alt="" fill className="object-cover" sizes="56px" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-[10px] text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                    {reviews.length > REVIEWS_PER_PAGE && (
                                        <div className="flex items-center justify-center gap-2 pt-1">
                                            <button
                                                type="button"
                                                aria-label="Previous reviews"
                                                disabled={reviewPage <= 0}
                                                onClick={() => setReviewPage((p) => Math.max(0, p - 1))}
                                                className="inline-flex items-center gap-0.5 px-2 py-1 text-[10px] font-semibold text-gray-600 border border-gray-200 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                                            >
                                                <ChevronLeft className="w-3 h-3" />
                                                Previous
                                            </button>
                                            <span className="text-[10px] text-gray-400 tabular-nums px-1">
                                                {reviewPage + 1} / {totalReviewPages}
                                            </span>
                                            <button
                                                type="button"
                                                aria-label="Next reviews"
                                                disabled={reviewPage >= totalReviewPages - 1}
                                                onClick={() => setReviewPage((p) => Math.min(totalReviewPages - 1, p + 1))}
                                                className="inline-flex items-center gap-0.5 px-2 py-1 text-[10px] font-semibold text-gray-600 border border-gray-200 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                                            >
                                                Next
                                                <ChevronRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="mt-6 text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded">No reviews yet. Be the first!</p>
                            )}
                        </div>

                        {/* Right: Submit Review Form */}
                        <div className="md:col-span-2 bg-gray-50 rounded border border-gray-100 p-6">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-4">Submit Your Review</h3>
                            {!isAuthenticated ? (
                                <div className="text-center py-6">
                                <p className="text-sm text-gray-500 mb-3">Please log in to write a review.</p>
                                <Link href="/login" className="px-5 py-2 bg-orange-500 text-white font-bold text-sm rounded hover:bg-orange-600 transition-colors">
                                        Log In to Review
                                    </Link>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                <p className="text-xs text-gray-500">Your email will not be published. Required fields are marked *</p>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">How do you feel about this product?</label>
                                        <StarRating value={rating} onChange={setRating} />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Write Your Review... *</label>
                                        <textarea
                                            rows={4}
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                            required
                                            placeholder="Share your experience..."
                                            className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-gray-800 resize-none focus:outline-none focus:border-orange-400 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Your Rating *</label>
                                        <select value={rating} onChange={e => setRating(Number(e.target.value))} className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-orange-400 bg-white cursor-pointer">
                                            {[5, 4, 3, 2, 1].map(s => <option key={s} value={s}>{'★'.repeat(s)}</option>)}
                                        </select>
                                    </div>

                                    {/* Image uploads */}
                                    {reviewImages.length > 0 && (
                                        <div className="flex gap-2 flex-wrap">
                                            {reviewImages.map((img, i) => (
                                                <div key={i} className="relative w-14 h-14 rounded border overflow-hidden group">
                                                    <Image src={img} alt="" fill className="object-cover" sizes="56px" />
                                                    <button type="button" onClick={() => setReviewImages(p => p.filter((_, idx) => idx !== i))}
                                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition-opacity">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {reviewImages.length < 5 && (
                                        <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-orange-500 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                            Add Photos
                                            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                                        </label>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || isUploading}
                                        className="w-full py-2.5 bg-gray-900 text-white text-sm font-black uppercase tracking-wider rounded hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
            </div>
        </div>
    );
}
