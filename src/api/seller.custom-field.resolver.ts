import { Args, ResolveField, Parent, Resolver } from '@nestjs/graphql';
import { AssetService, Ctx, ID, RequestContext, Seller, SellerService } from '@vendure/core'
import { SELLER_VERIFY_INIT_OPTIONS } from '../constants';
import { VerifySellerPluginOptions } from '../types';
import { Inject } from "@nestjs/common";


@Resolver('Seller')
export class SellerCustomFieldsResolver {
    constructor(private assetService: AssetService, @Inject(SELLER_VERIFY_INIT_OPTIONS) private config: VerifySellerPluginOptions){

    }

    @ResolveField()
    async customFields(@Ctx() ctx: RequestContext,  @Parent() seller: Seller) {
        const fields= this.config.fields;
        const sellerInformation= JSON.parse(seller.customFields.information);
        if(!sellerInformation){
            return seller.customFields;
        }
        for(let fieldIndex=0; fieldIndex<fields.length;fieldIndex++){
            const field= fields[fieldIndex];
            if(field.fieldType === 'file'){
                const assetId= sellerInformation[field.fieldName].value;
                sellerInformation[field.fieldName].value= await this.assetService.findOne(ctx,this.parseTestID(assetId));
            }
        }
        return {
            ...seller.customFields,
            information: JSON.stringify(sellerInformation)
        };
    }

    private parseTestID(posssibleTestId: ID): ID{
        if(typeof(posssibleTestId) === 'string' && posssibleTestId.startsWith('T_')){
            const parts=posssibleTestId.split('T_') 
            return parts[parts.length-1];
        }
        return posssibleTestId;
    }

}