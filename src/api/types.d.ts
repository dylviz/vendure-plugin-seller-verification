import { CustomSellerFields } from '@vendure/core/dist/entity/custom-entity-fields';

declare module '@vendure/core/dist/entity/custom-entity-fields' {
    interface CustomSellerFields {
        requestesVerification: boolean;
        isVerified: boolean;
        information: string;
    }
}