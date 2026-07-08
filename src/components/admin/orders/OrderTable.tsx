import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Archive, RotateCcw, Eye, Trash2 } from 'lucide-react';
import { getOrderStatusDescription } from '@/lib/utils';
import OrderSourceBadge from './OrderSourceBadge';

interface OrderTableProps {
    orders: any[];
    isLoading: boolean;
    formatPrice: (price: number) => string;
    formatDate: (date: string) => string;
    getStatusStyle: (status: string) => string;
    onArchive?: (id: string) => void;
    onRestore?: (id: string) => void;
    onHardDelete?: (id: string) => void;
    isArchived?: boolean;
}

export default function OrderTable({
    orders,
    isLoading,
    formatPrice,
    formatDate,
    getStatusStyle,
    onArchive,
    onRestore,
    onHardDelete,
    isArchived = false,
}: OrderTableProps) {
    const router = useRouter();

    return (
        <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                        Loading orders...
                                    </td>
                                </tr>
                            ) : orders.length > 0 ? (
                                orders.map((order: any) => (
                                    <tr
                                        key={order._id}
                                        onClick={() => router.push(`/admin/orders/${order._id}`)}
                                        className="hover:bg-gray-50 transition-colors bg-white cursor-pointer group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {order.products?.[0]?.image && (
                                                    <img 
                                                        src={order.products[0].image} 
                                                        alt="Product" 
                                                        className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0" 
                                                    />
                                                )}
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors font-mono">
                                                            #{order.orderId}
                                                        </span>
                                                        <OrderSourceBadge source={order.source} />
                                                        {order.isPreorder && (
                                                            <span className="bg-orange-100 text-orange-600 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border border-orange-200">
                                                                Pre-order
                                                            </span>
                                                        )}
                                                    </div>
                                                    {order.products?.length > 1 && (
                                                        <span className="text-[10px] text-gray-500 font-medium">+{order.products.length - 1} more items</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-900 font-medium">{order.customerInfo.name}</span>
                                                <span className="text-xs text-gray-500">{order.customerInfo.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatPrice(order.totalAmount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span 
                                                    className={`group relative px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(order.orderStatus)}`}
                                                >
                                                    {order.orderStatus}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all w-max max-w-[220px] bg-gray-900 text-white text-[10px] leading-relaxed px-2 py-1 rounded shadow-lg z-50 font-medium normal-case tracking-normal pointer-events-none text-center">
                                                        {getOrderStatusDescription(order.orderStatus)}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-gray-900"></div>
                                                    </div>
                                                </span>
                                                <div className="flex items-center gap-1.5 px-1">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                    <span className="text-xs text-gray-500">{order.paymentStatus}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-500">
                                                {formatDate(order.createdAt)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/admin/orders/${order._id}`);
                                                    }}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {order.isArchived ? (
                                                    <>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onRestore?.(order._id);
                                                            }}
                                                            className="text-gray-400 hover:text-green-600 transition-colors"
                                                            title="Restore"
                                                        >
                                                            <RotateCcw size={18} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onHardDelete?.(order._id);
                                                            }}
                                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                                            title="Permanently Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onArchive?.(order._id);
                                                        }}
                                                        className="text-gray-400 hover:text-rose-500 transition-colors"
                                                        title="Archive"
                                                    >
                                                        <Archive size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                        No recent orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {isLoading ? (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-sm text-gray-500">
                        Loading orders...
                    </div>
                ) : orders.length > 0 ? (
                    orders.map((order: any) => (
                        <div
                            key={order._id}
                            onClick={() => router.push(`/admin/orders/${order._id}`)}
                            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4 cursor-pointer hover:border-gray-300 transition-all group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    {order.products?.[0]?.image && (
                                        <img 
                                            src={order.products[0].image} 
                                            alt="Product" 
                                            className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0" 
                                        />
                                    )}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors font-mono">
                                                #{order.orderId}
                                            </span>
                                            <OrderSourceBadge source={order.source} />
                                            {order.isPreorder && (
                                                <span className="bg-orange-100 text-orange-600 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border border-orange-200">
                                                    Pre-order
                                                </span>
                                            )}
                                        </div>
                                        {order.products?.length > 1 && (
                                            <span className="text-[10px] text-gray-500 font-medium">+{order.products.length - 1} more items</span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium">{formatDate(order.createdAt)}</span>
                            </div>

                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Customer</span>
                                    <span className="text-sm font-bold text-gray-800">{order.customerInfo.name}</span>
                                    <span className="text-xs text-gray-500">{order.customerInfo.phone}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Total</span>
                                    <p className="text-sm font-black text-gray-900">{formatPrice(order.totalAmount)}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex flex-col gap-1.5">
                                    <span 
                                        className={`group relative px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest text-center ${getStatusStyle(order.orderStatus)}`}
                                    >
                                        {order.orderStatus}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all w-max max-w-[220px] bg-gray-900 text-white text-[10px] leading-relaxed px-2 py-1 rounded shadow-lg z-50 font-medium normal-case tracking-normal pointer-events-none text-center">
                                            {getOrderStatusDescription(order.orderStatus)}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-gray-900"></div>
                                        </div>
                                    </span>
                                    <div className="flex items-center gap-1.5 px-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-rose-500'}`} />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{order.paymentStatus}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/admin/orders/${order._id}`);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-black text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-all shadow-md active:scale-95"
                                    >
                                        View Details
                                    </button>
                                    {order.isArchived ? (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRestore?.(order._id);
                                                }}
                                                className="p-2 text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all active:scale-95"
                                                title="Restore"
                                            >
                                                <RotateCcw size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onHardDelete?.(order._id);
                                                }}
                                                className="p-2 text-red-400 border border-red-100 rounded-lg hover:bg-red-50 transition-all active:scale-95"
                                                title="Permanently Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onArchive?.(order._id);
                                            }}
                                            className="p-2 text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all active:scale-95"
                                            title="Archive"
                                        >
                                            <Archive size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-sm text-gray-500">
                        No orders found.
                    </div>
                )}
            </div>
        </div>
    );
}
