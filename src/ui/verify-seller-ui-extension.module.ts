import { NgModule } from "@angular/core";
import { addNavMenuSection } from "@vendure/admin-ui/core";

@NgModule({
	providers: [
		addNavMenuSection(
			{
				id: "verify-seller-nav",
				label: "Verify Seller",
				items: [
					{
						id: "verify-seller",
						label: "Verify Seller",
						routerLink: ["/extensions/verify-seller"],
						icon: "folder-open",
					},
				],
				requiresPermission: "SuperAdmin",
			},
			// Add this section before the "settings" section
			"settings"
		),
	],
})
export class VerifySellerExtensionModule {}
