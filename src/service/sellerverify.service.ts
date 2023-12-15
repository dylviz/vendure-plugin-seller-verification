import { Injectable } from "@nestjs/common";
import { UpdateSellerInput } from "@vendure/common/lib/generated-types";
import {
	ChannelService,
	ID,
	Permission,
	RequestContext,
	RoleService,
} from "@vendure/core";
import { Seller } from "@vendure/core/dist/entity/seller/seller.entity";
import { SellerService } from "@vendure/core/dist/service/services/seller.service";
import { SUPER_ADMIN_ROLE_CODE } from "@vendure/common/lib/shared-constants";

import {
	SetBulkSellerVerificationStatusInput,
	SetSellerVerificationStatusInput,
} from "../types";
import { Success } from "../ui/generated-admin-types";
export const additionalPermissions: Permission[] = [
	Permission.CreateProduct,
	Permission.ReadProduct,
	Permission.UpdateProduct,
	Permission.DeleteProduct,
	Permission.CreateCatalog,
	Permission.ReadCatalog,
	Permission.UpdateCatalog,
	Permission.DeleteCatalog,
	Permission.CreateAsset,
	Permission.ReadAsset,
	Permission.UpdateAsset,
	Permission.DeleteAsset,
];
declare module "@vendure/core/dist/entity/custom-entity-fields" {
	interface CustomSellerFields {
		isVerified?: boolean;
	}
}

@Injectable()
export class SellerVerifyService {
	constructor(
		private sellerService: SellerService,
		private channelService: ChannelService,
		private roleService: RoleService
	) {}

	/**
	 * Update the seller verification status
	 * @param ctx
	 * @param sellerIsVerified
	 * @returns
	 */
	async setSellerVerificationStatus(
		ctx: RequestContext,
		sellerIsVerified: SetSellerVerificationStatusInput
	): Promise<Seller | undefined> {
		const { sellerId, isVerified } = sellerIsVerified;
		/**
		 * Get seller id
		 * Get channels of seller
		 * Get roles of channel
		 * Update permissions for them
		 */
		const seller = await this.sellerService.findOne(ctx, sellerId);
		const channels = await this.channelService.findAll(ctx, {
			filter: {
				sellerId: { eq: String(seller?.id) },
			},
		});
		const roles = await this.roleService.findAll(ctx, {
			filter: {
				code: { eq: `${channels.items[0]?.code}-admin` },
			},
		});
		// const roleID = roles.items[0]?.id;

		if (seller && roles.totalItems) {
			const updatedSeller: UpdateSellerInput = {
				id: seller.id,
				name: seller.name,
				customFields: {
					isVerified,
				},
			};

			//Update permissions
			let updatedPermissions: Permission[] = [];

			const nonSuperadminRole = roles.items.find(
				(r) => r.code !== SUPER_ADMIN_ROLE_CODE
			);
			if (!nonSuperadminRole) {
				return;
			}
			// Append permissions if the condition is true
			if (isVerified) {
				updatedPermissions = [
					...(nonSuperadminRole?.permissions ?? []),
					...additionalPermissions,
				];
			} else {
				// Remove permissions if the condition is false
				updatedPermissions = nonSuperadminRole.permissions.filter(
					(permission) => !additionalPermissions.includes(permission)
				);
			}

			const updatedRole = {
				id: nonSuperadminRole.id,
				permissions: updatedPermissions,
				// [
				// 	Permission.CreateCatalog,
				// 	Permission.UpdateCatalog,
				// 	Permission.ReadCatalog,
				// 	Permission.DeleteCatalog,
				// 	Permission.CreateOrder,
				// 	Permission.ReadOrder,
				// 	Permission.UpdateOrder,
				// 	Permission.DeleteOrder,
				// 	Permission.ReadCustomer,
				// 	Permission.ReadPaymentMethod,
				// 	Permission.ReadShippingMethod,
				// 	Permission.ReadPromotion,
				// 	Permission.ReadCountry,
				// 	Permission.ReadZone,
				// 	Permission.CreateCustomer,
				// 	Permission.UpdateCustomer,
				// 	Permission.DeleteCustomer,
				// 	Permission.CreateTag,
				// 	Permission.ReadTag,
				// 	Permission.UpdateTag,
				// 	Permission.DeleteTag,
				// ],
			};
			await this.roleService.update(ctx, updatedRole);

			return this.sellerService.update(ctx, updatedSeller);
		}
	}

	async setBulkSellerVerificationStatus(
		ctx: RequestContext,
		input: SetBulkSellerVerificationStatusInput
	): Promise<Success> {
		await Promise.all(
			input.sellerIds.map((id) =>
				this.setSellerVerificationStatus(ctx, {
					isVerified: input.areVerified,
					sellerId: id,
				})
			)
		);
		return { success: true };
	}
}
