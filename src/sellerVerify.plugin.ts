import { LanguageCode, PluginCommonModule, VendurePlugin } from "@vendure/core";
import { adminSchema } from "./api/api-extensions";
import { AdminExtResolver } from "./api/adminExt.resolver";
import { SellerVerifyService } from "./service/sellerverify.service";
import { AdminUiExtension } from "@vendure/ui-devkit/compiler";
import path from "path";

@VendurePlugin({
	imports: [PluginCommonModule],
	compatibility: ">0.0.0",
	providers: [SellerVerifyService],
	adminApiExtensions: {
		resolvers: [AdminExtResolver],
		schema: adminSchema,
	},
	configuration: (config) => {
		config.customFields.Seller.push({
			name: "isVerified",
			type: "boolean",
			defaultValue: false,
			readonly: true,
			label: [
				{
					languageCode: LanguageCode.en,
					value: "Seller Verification Status",
				},
			],
		});

		return config;
	},
})
export class SellerVerifyPlugin {
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
