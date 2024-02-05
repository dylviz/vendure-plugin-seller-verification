import { AdminUiPlugin } from "@vendure/admin-ui-plugin";
import {
	DefaultLogger,
	DefaultSearchPlugin,
	LogLevel,
	Role,
	mergeConfig,
} from "@vendure/core";
import {
	createTestEnvironment,
	registerInitializer,
	SqljsInitializer,
	testConfig,
} from "@vendure/testing";
import { initialTestData } from "./initial-test-data";
import { compileUiExtensions } from "@vendure/ui-devkit/compiler";
import path from "path";
import { SellerVerifyPlugin } from "../src/sellerVerify.plugin";
import { populateAdditionalData } from "./populate";

require("dotenv").config();

(async () => {
	registerInitializer("sqljs", new SqljsInitializer("__data__"));
	const devConfig = mergeConfig(testConfig, {
		logger: new DefaultLogger({ level: LogLevel.Debug }),
		plugins: [
			SellerVerifyPlugin.init({fields: [
				{fieldName: "Bank Account", fieldType: "text"},
				{fieldName: "Driving License", fieldType: "file"}
			]}),
			DefaultSearchPlugin,
			AdminUiPlugin.init({
				port: 3002,
				route: "admin",
				app: compileUiExtensions({
					outputPath: path.join(__dirname, "__admin-ui"),
					extensions: [SellerVerifyPlugin.uiExtensions],
					devMode: true,
				}),
			}),
		],
		apiOptions: {
			port: 3050,
			shopApiPlayground: true,
			adminApiPlayground: true,
		},
	});
	const { server, adminClient } = createTestEnvironment(devConfig);
	await server.init({
		initialData: initialTestData,
		productsCsvPath: "./test/products.csv",
	});
	await populateAdditionalData(adminClient)
})();
