import { NgModule } from "@angular/core";
import {
	SharedModule,
	addNavMenuSection,
	addNavMenuItem,
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
		addNavMenuItem({
			id: 'request-verification',
			label: 'Request Verification',
			routerLink: ['/extensions/verify-seller'],
			icon: 'folder-ope',
			requiresPermission:'AllowRequestVerificationPermission'
		},
		'settings'),
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
