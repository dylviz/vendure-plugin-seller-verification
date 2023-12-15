import {
	Resolver,
	Args,
	Mutation,
} from "@nestjs/graphql";
import {
	Permission,
	Allow,
	RequestContext,
	Ctx,
	Transaction,
} from "@vendure/core";
import { SellerVerifyService } from "../service/sellerverify.service";
import { SetBulkSellerVerificationStatusInput, SetSellerVerificationStatusInput } from "../types";
import { Seller } from "@vendure/core/dist/entity/seller/seller.entity";
import { Success } from "../ui/generated-admin-types";

@Resolver()
export class AdminExtResolver {
	constructor(private sellerVerifyService: SellerVerifyService) {}

	@Transaction()
	@Mutation()
	@Allow(Permission.SuperAdmin)
	async setSellerVerificationStatus(
		@Ctx() ctx: RequestContext,
		@Args() args: { input: SetSellerVerificationStatusInput }
	): Promise<Seller | undefined> {
		return this.sellerVerifyService.setSellerVerificationStatus(
			ctx,
			args.input
		);
	}

	@Transaction()
	@Mutation()
	@Allow(Permission.SuperAdmin)
	async setBulkSellerVerificationStatus(
		@Ctx() ctx: RequestContext,
		@Args() args: { input: SetBulkSellerVerificationStatusInput }
	): Promise<Success> {
		return this.sellerVerifyService.setBulkSellerVerificationStatus(
			ctx,
			args.input
		);
	}
}
