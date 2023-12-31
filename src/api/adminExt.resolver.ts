import {
	Resolver,
	ResolveField,
	Query,
	Args,
	Mutation,
	Parent,
} from "@nestjs/graphql";
import {
	Permission,
	Allow,
	RequestContext,
	Ctx,
	Logger,
	Transaction,
} from "@vendure/core";
import { SellerVerifyService } from "../service/sellerverify.service";
import { SetSellerVerificationStatusInput } from "../types";
import { Seller } from "@vendure/core/dist/entity/seller/seller.entity";

@Resolver()
export class AdminExtResolver {
	constructor(private sellerVerifyService: SellerVerifyService) {}

	@Transaction()
	@Mutation()
	@Allow(Permission.SuperAdmin)
	async setSellerVerificationStatus(
		@Ctx() ctx: RequestContext,
		@Args() args: { input: SetSellerVerificationStatusInput }
	): Promise<Seller> {
		return this.sellerVerifyService.setSellerVerificationStatus(
			ctx,
			args.input
		);
	}
}
