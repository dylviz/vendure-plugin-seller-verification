import {
	Resolver,
	Args,
	Query,
	Mutation,
} from "@nestjs/graphql";
import {
	Permission,
	Allow,
	RequestContext,
	Ctx,
	Transaction,
	ID,
} from "@vendure/core";
import { SellerVerifyService } from "../service/sellerverify.service";
import { SetBulkSellerVerificationStatusInput, SetSellerVerificationStatusInput, VerifySellerPluginOptions } from "../types";
import { Seller } from "@vendure/core/dist/entity/seller/seller.entity";
import { Success } from "../ui/generated-admin-types";
import { Inject } from "@nestjs/common";
import { SELLER_VERIFY_INIT_OPTIONS } from "../constants";
import { SellerInformationField } from "src/ui/types";

@Resolver()
export class AdminExtResolver {
	constructor(private sellerVerifyService: SellerVerifyService, 
		@Inject(SELLER_VERIFY_INIT_OPTIONS) private config: VerifySellerPluginOptions) {}

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


	@Transaction()
	@Mutation()
	async requestVerification(@Ctx() ctx: RequestContext,
	@Args() args: { sellerInformation: JSON, sellerId:ID }):Promise<Success>{
		console.log(args,'-------------------')
		return this.sellerVerifyService.requestVerification(
			ctx,
			args.sellerInformation,
			args.sellerId
		);
	}

	@Query()
	@Allow(Permission.SuperAdmin)
	getSellerInformationFields():SellerInformationField[]{
		return this.config.fields;
	}
}
