import { Injectable } from "@nestjs/common";
import { RequestContext } from "@vendure/core";
import { SellerService } from "@vendure/core/dist/service/services/seller.service";
import { Seller } from "@vendure/core/dist/entity/seller/seller.entity";
import { SetSellerVerificationStatusInput } from "../types";
import { UpdateSellerInput } from "@vendure/common/lib/generated-types";

declare module "@vendure/core/dist/entity/custom-entity-fields" {
	interface CustomSellerFields {
		isVerified?: boolean;
	}
}

@Injectable()
export class SellerVerifyService {
	constructor(private sellerService: SellerService) {}

	/**
	 * Update the seller verification status
	 * @param ctx
	 * @param sellerIsVerified
	 * @returns
	 */
	async setSellerVerificationStatus(
		ctx: RequestContext,
		sellerIsVerified: SetSellerVerificationStatusInput
	): Promise<Seller> {
		const { sellerId, isVerified } = sellerIsVerified;

		//Get seller based on ID
		const seller = await this.sellerService.findOne(ctx, sellerId);

		if (seller) {
			const updatedSeller: UpdateSellerInput = {
				id: seller.id,
				name: seller.name,
				customFields: {
					isVerified: isVerified,
				},
			};
			return this.sellerService.update(ctx, updatedSeller);
		}
		return {} as Seller;
	}
}
