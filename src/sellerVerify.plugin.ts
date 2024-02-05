import { InternalServerError, LanguageCode, PluginCommonModule, VendurePlugin } from "@vendure/core";
import { adminSchema } from "./api/api-extensions";
import { AdminExtResolver, allowRequestVerificationPermission } from "./api/adminExt.resolver";
import { SellerVerifyService } from "./service/sellerverify.service";
import { AdminUiExtension } from "@vendure/ui-devkit/compiler";
import path from "path";
import { VerifySellerPluginOptions } from "./types";
import { SELLER_VERIFY_INIT_OPTIONS } from "./constants";
import { SellerInformationField } from "./ui/types";
import { SellerCustomFieldsResolver } from "./api/seller.custom-field.resolver";

function hasUniqueValues(arr: SellerInformationField[], fieldName: keyof SellerInformationField): boolean {
	const uniqueValues = new Set();
  
	for (const obj of arr) {
	  const value = obj[fieldName];
  
	  if (uniqueValues.has(value)) {
		// Duplicate value found
		return false;
	  }
  
	  uniqueValues.add(value);
	}
  
	// No duplicate values found
	return true;
  }
@VendurePlugin({
	imports: [PluginCommonModule],
	compatibility: ">0.0.0",
	providers: [
		SellerVerifyService,
		{
			provide: SELLER_VERIFY_INIT_OPTIONS,
			useFactory: () => SellerVerifyPlugin.config,
		}
	],
	adminApiExtensions: {
		resolvers: [AdminExtResolver, SellerCustomFieldsResolver],
		schema: adminSchema,
	},
	configuration: (config) => {
		config.customFields.Seller.push({
			name: "isVerified",
			type: "boolean",
			defaultValue: false,
			label: [
				{
					languageCode: LanguageCode.en,
					value: "Seller Verification Status",
				},
			],
		});
		config.customFields.Seller.push({
			name: "requestesVerification",
			type: "boolean",
			defaultValue: false,
			label: [
				{
					languageCode: LanguageCode.en,
					value: "Requests Verification",
				},
			],
		});
		config.customFields.Seller.push({
			name: "information",
			type: "text",
			nullable: true,
			label: [
				{
					languageCode: LanguageCode.en,
					value: "Seller Information",
				},
			],
		});
		config.authOptions.customPermissions.push(allowRequestVerificationPermission);
		return config;
	},
})
export class SellerVerifyPlugin {
	static config: VerifySellerPluginOptions;

	static init(config: VerifySellerPluginOptions): typeof SellerVerifyPlugin {
		this.config = config;
		if(!this.config?.fields){
			this.config={fields: []}
		}
		if(!hasUniqueValues(config.fields,'fieldName')){
			throw new InternalServerError('Duplicate fields with the same value for "fieldName" found in SellerVerifyPlugin')
		}
		return SellerVerifyPlugin;
	  }

	static uiExtensions: AdminUiExtension = {
		extensionPath: path.join(__dirname, "ui"),
		ngModules: [
			{
				type: "lazy",
				route: "verify-seller",
				ngModuleFileName: "verify-seller-ui-lazy.module.ts",
				ngModuleName: "VerifySellerUIModule",
			},
			{
				type: "shared",
				ngModuleFileName: "verify-seller-ui-extension.module.ts",
				ngModuleName: "VerifySellerExtensionModule",
			},
		],
	};
}
