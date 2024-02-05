import { ID } from "@vendure/core";
import { SellerInformationField } from './ui/types';

export interface SetSellerVerificationStatusInput {
	sellerId: ID;
	isVerified: boolean;
}

export interface SetBulkSellerVerificationStatusInput {
	sellerIds: ID[];
	areVerified: boolean;
}

export interface VerifySellerPluginOptions{
	fields: SellerInformationField[]
}