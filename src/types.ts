import { ID } from "@vendure/core";

export interface SetSellerVerificationStatusInput {
	sellerId: ID;
	isVerified: boolean;
}

export interface SetBulkSellerVerificationStatusInput {
	sellerIds: ID[];
	areVerified: boolean;
}
