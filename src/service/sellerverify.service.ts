import { Injectable } from '@nestjs/common';
import { UpdateSellerInput } from '@vendure/common/lib/generated-types';
import { ChannelService, Permission, RequestContext, RoleService } from '@vendure/core';
import { Seller } from '@vendure/core/dist/entity/seller/seller.entity';
import { SellerService } from '@vendure/core/dist/service/services/seller.service';

import { SetSellerVerificationStatusInput } from '../types';

declare module '@vendure/core/dist/entity/custom-entity-fields' {
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
  ): Promise<Seller> {
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
    const roleID = roles.items[0]?.id;

    if (seller && roles) {
      const updatedSeller: UpdateSellerInput = {
        id: seller.id,
        name: seller.name,
        customFields: {
          isVerified: isVerified,
        },
      };

      const updatedRole = {
        id: roleID,
        permissions: [
          Permission.CreateCatalog,
          Permission.UpdateCatalog,
          Permission.ReadCatalog,
          Permission.DeleteCatalog,
          Permission.CreateOrder,
          Permission.ReadOrder,
          Permission.UpdateOrder,
          Permission.DeleteOrder,
          Permission.ReadCustomer,
          Permission.ReadPaymentMethod,
          Permission.ReadShippingMethod,
          Permission.ReadPromotion,
          Permission.ReadCountry,
          Permission.ReadZone,
          Permission.CreateCustomer,
          Permission.UpdateCustomer,
          Permission.DeleteCustomer,
          Permission.CreateTag,
          Permission.ReadTag,
          Permission.UpdateTag,
          Permission.DeleteTag,
        ],
      };

      await this.roleService.update(ctx, updatedRole);

      return this.sellerService.update(ctx, updatedSeller);
    }

    return {} as Seller;
  }
}
