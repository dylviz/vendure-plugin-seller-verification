import { NgModule } from "@angular/core";
import {
	SharedModule,
	addNavMenuSection,
	registerBulkAction,
	registerDataTableComponent
} from "@vendure/admin-ui/core";
import {
	disableOnClickCallBack,
	enableOnClickCallBack,
	isSuperAdmin,
} from "./helpers";
import { SellerInformationCellComponent } from "./components/seller-information-cell/seller-information-cell.component";

@NgModule({
	imports: [SharedModule],
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
		registerBulkAction({
			location: "seller-list",
			label: "Enable Selected Seller(s)",
			icon: "check",
			isVisible: ({ injector }) => isSuperAdmin(injector),
			onClick: ({ injector, selection }) => {
				enableOnClickCallBack(injector, selection);
			},
		}),
		registerBulkAction({
			location: "seller-list",
			label: "Disable Selected Seller(s)",
			icon: "times",
			isVisible: ({ injector }) => isSuperAdmin(injector),
			onClick: ({ injector, selection }) => {
				disableOnClickCallBack(injector, selection);
			},
		}),
		registerDataTableComponent({
			component: SellerInformationCellComponent,
			tableId: 'seller-list',
			columnId: 'information',
		}),
	],
})
export class VerifySellerExtensionModule {}
