import { CreateSellerInput, CreateChannelInput,CreateRoleInput, Permission, CurrencyCode} from '@vendure/common/lib/generated-types';
import { LanguageCode } from '@vendure/core';
export const createSellerInput= [
    {
        name: "Andy Murray",
    }
] as CreateSellerInput[]

export const createChannelInput=[
    {
        code: 'test-1',
        defaultLanguageCode: LanguageCode.en,
        defaultShippingZoneId: 1,
        defaultTaxZoneId: 1,
        pricesIncludeTax: true,
        token: 'test-1-token',
        defaultCurrencyCode: CurrencyCode.USD
    }
] as CreateChannelInput[]

export const createRoleInput=[
    {
        code: 'test-1-admin',
        description: 'role-1-description',
        permissions: [
            Permission.CreateAdministrator,
            Permission.Authenticated,
            Permission.UpdateGlobalSettings,
            Permission.DeleteCustomerGroup
        ]
    }
] as CreateRoleInput[]