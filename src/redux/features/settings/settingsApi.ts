import { apiSlice } from '../../api/apiSlice';
import { ISettings } from '@/types';

export const settingsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPublicSettings: builder.query<{ success: boolean; settings: ISettings }, void>({
            query: () => '/settings/logo',
            providesTags: ['Settings'],
        }),
        getAdminSettings: builder.query<{ success: boolean; settings: ISettings }, void>({
            query: () => '/admin/settings/contact',
            providesTags: ['Settings'],
        }),
        getMarketingSettings: builder.query<{ success: boolean; settings: ISettings }, void>({
            query: () => '/admin/settings/marketing',
            providesTags: ['Settings'],
        }),
        getGeneralSettings: builder.query<{ success: boolean; settings: ISettings }, void>({
            query: () => '/admin/settings/general',
            providesTags: ['Settings'],
        }),
        updateSettings: builder.mutation<{ success: boolean; settings: ISettings }, Partial<ISettings>>({
            query: (body) => ({
                url: '/admin/settings/contact',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Settings'],
        }),
        updateLogoSettings: builder.mutation<{ success: boolean; settings: ISettings }, { logoUrl?: string; logoWidth?: number; logoHeight?: number; faviconUrl?: string }>({
            query: (body) => ({
                url: '/admin/settings/logo',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Settings'],
        }),
        updateMarketingSettings: builder.mutation<{ success: boolean; settings: ISettings }, { facebookPixelId?: string; googleTagManagerId?: string; tiktokPixelId?: string }>({
            query: (body) => ({
                url: '/admin/settings/marketing',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Settings'],
        }),
        updateGeneralSettings: builder.mutation<{ success: boolean; settings: ISettings }, { brandName?: string; shippingChargeInsideDhaka?: number; shippingChargeOutsideDhaka?: number }>({
            query: (body) => ({
                url: '/admin/settings/general',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Settings'],
        }),
        getPublicGeneralSettings: builder.query<{ success: boolean; settings: ISettings }, void>({
            query: () => '/settings/general',
            providesTags: ['Settings'],
        }),
    }),
});

export const {
    useGetPublicSettingsQuery,
    useGetAdminSettingsQuery,
    useGetMarketingSettingsQuery,
    useUpdateSettingsMutation,
    useUpdateLogoSettingsMutation,
    useUpdateMarketingSettingsMutation,
    useGetGeneralSettingsQuery,
    useUpdateGeneralSettingsMutation,
    useGetPublicGeneralSettingsQuery,
} = settingsApi;
