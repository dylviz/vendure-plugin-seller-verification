import { ID } from "@vendure/core";

export interface SetSellerVerificationStatusInput {
	sellerId: ID;
	isVerified: boolean;
}
