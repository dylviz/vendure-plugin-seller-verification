import {
	Channel,
	DefaultLogger,
	LogLevel,
	Role,
	mergeConfig,
} from "@vendure/core";
import {
	createTestEnvironment,
	registerInitializer,
	SimpleGraphQLClient,
	SqljsInitializer,
	testConfig,
} from "@vendure/testing";
import { TestServer } from "@vendure/testing/lib/test-server";
import { expect, describe, beforeAll, afterAll, it } from "vitest";
import { SellerVerifyPlugin } from "../src";
import { testPaymentMethod } from "./test-payment-method";
import { initialTestData } from "./initial-test-data";
import {
	Seller,
	MutationCreateSellerArgs,
} from "@vendure/common/lib/generated-types";
import {
	createSellerInput,
	createChannelInput,
	createRoleInput,
} from "./create-input";
import { gql } from "graphql-tag";
import { additionalPermissions } from "../src/service/sellerverify.service";
import { SellerInformationField } from "../src/ui/types";
import { CREATE_CHANNEL, CREATE_ROLE, CREATE_SELLER, GET_ROLE, GET_SELLER_INFORMATION_FIELDS, REQUEST_VERIFICATION, sellerVerfifcationStatusQuery } from "./helpers";
import path from "path";
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { createUploadLink, Upload } from 'apollo-upload-client';
import { ApolloLink } from '@apollo/client/core';
import express from 'express';
import {Stream} from 'stream';
describe("Seller Verifcation Plugin", function () {
	let server: TestServer;
	let adminClient: SimpleGraphQLClient;
	let sellers: Seller[] = [];
	let channels: Channel[] = [];
	let roles: Role[] = [];
	let verificationRequesteeSellerId;
	const serverPort= 3106;
	let sellerInformationFields: SellerInformationField[]=[
		{fieldName: "Bank Account", fieldType: "text"},
		{fieldName: "Driving License", fieldType: "file"}
	]
	beforeAll(async () => {
		registerInitializer("sqljs", new SqljsInitializer("__data__"));
		const config = mergeConfig(testConfig, {
			apiOptions: {
				port: serverPort,
			},
			logger: new DefaultLogger({ level: LogLevel.Debug }),
			plugins: [
					SellerVerifyPlugin.init({fields: sellerInformationFields})
			],
			paymentOptions: {
				paymentMethodHandlers: [testPaymentMethod],
			},
		});
		({ server, adminClient } = createTestEnvironment(config));
		await server.init({
			initialData: {
				...initialTestData,
				paymentMethods: [
					{
						name: testPaymentMethod.code,
						handler: { code: testPaymentMethod.code, arguments: [] },
					},
				],
			},
			productsCsvPath: "./test/products.csv",
			customerCount: 2,
		});
		await adminClient.asSuperAdmin();
		//create additional Seller
		for (let sellerInfo of createSellerInput) {
			const { createSeller: newSeller } = await adminClient.query<
				{ createSeller: Seller },
				MutationCreateSellerArgs
			>(
				CREATE_SELLER,
				{ input: { name: sellerInfo.name } }
			);
			sellers.push(newSeller);
		}
		verificationRequesteeSellerId= sellers[sellers.length-1].id;
		//create additional Channel associated with new Seller
		for (let createChannelIndex in createChannelInput) {
			const { createChannel: newChannel } = await adminClient.query(
				CREATE_CHANNEL,
				{
					input: {
						...createChannelInput[createChannelIndex],
						sellerId: sellers[createChannelIndex].id,
					},
				}
			);
			channels.push(newChannel);
		}
		//Create Role associated with the new Channel
		for (let roleIndex in createRoleInput) {
			const { createRole } = await adminClient.query(
				CREATE_ROLE,
				{
					input: {
						...createRoleInput[roleIndex],
						channelIds: channels[roleIndex].id,
					},
				}
			);
			roles.push(createRole);
		}
		server.app.use(express.json({limit: '50mb'}));
		server.app.use(express.urlencoded({limit: '50mb'}));
	}, 60000);

	it("Should verify sellers", async () => {
		const { setSellerVerificationStatus: updatedSeller } =
			await adminClient.query(sellerVerfifcationStatusQuery, {
				input: { sellerId: sellers[0].id, isVerified: true },
			});
		expect(updatedSeller.id).toBe(sellers[0].id);
		expect(updatedSeller.customFields.isVerified).toBe(true);
	});

	it("Should assign additional permisions to verified sellers", async () => {
		const verifiedSellerRole = roles[0];
		const { role: updatedRole } = await adminClient.query(
			GET_ROLE,
			{ id: parseInt(verifiedSellerRole.id.toString().split("_")[1]) }
		);
		expect(updatedRole.id).toBe(verifiedSellerRole.id);
		for (let permission of [
			...additionalPermissions,
			...createRoleInput[0].permissions,
		]) {
			expect(updatedRole.permissions).toContain(permission);
		}
	});

	it("Should revoke selller permisiion", async () => {
		const { setSellerVerificationStatus: updatedSeller } =
			await adminClient.query(sellerVerfifcationStatusQuery, {
				input: { sellerId: sellers[0].id, isVerified: false },
			});
		expect(updatedSeller.id).toBe(sellers[0].id);
		expect(updatedSeller.customFields.isVerified).toBe(false);
	});

	it("Should remove additional Permissions from sellers whose verification status has been revoked", async () => {
		const unverifiedSellerRole = roles[0];
		const { role: updatedRole } = await adminClient.query(
			GET_ROLE,
			{ id: parseInt(unverifiedSellerRole.id.toString().split("_")[1]) }
		);
		expect(updatedRole.id).toBe(unverifiedSellerRole.id);
		for (let permission of additionalPermissions) {
			expect(updatedRole.permissions).not.toContain(permission);
		}
		for (let permission of createRoleInput[0].permissions) {
			expect(updatedRole.permissions).toContain(permission);
		}
	});

	it('Should get seller Information fields', async()=>{
		const { getSellerInformationFields } = await adminClient.query(
			GET_SELLER_INFORMATION_FIELDS,
		);
		for(let field of getSellerInformationFields){
			const pluginField= sellerInformationFields.find((value)=> value.fieldName === field.fieldName);
			expect(pluginField?.fieldType).toBe(field.fieldType);
		}
	})

	it.skip('Should request verification', async()=>{
		const FormData = require('form-data');
		const fs = require('fs');
		const { request } = require('graphql-request');
		let sellerInformation={};
		const someGeneralText= "Hi There!";
		const someGeneralNumber=100;
		const testFilePath= path.join(__dirname, "test-file.png")
		const formData = new FormData();
		formData.append('sellerId', verificationRequesteeSellerId); 
		for(let field of sellerInformationFields){
			if(field.fieldType === "file"){
				// sellerInformation[field.fieldName]= fs.createReadStream(testFilePath);
				formData.append(`sellerInformation.${field.fieldName}`, fs.createReadStream(testFilePath));
			}
			else if(field.fieldType === "number"){
				//some general text
				// sellerInformation[field.fieldName]= someGeneralNumber;
				formData.append(`sellerInformation.${field.fieldName}`, someGeneralNumber);
			}
			else if(field.fieldType === "text"){
				//some general text
				// sellerInformation[field.fieldName]=someGeneralText;
				formData.append(`sellerInformation.${field.fieldName}`, someGeneralText);
			}else{
				throw new Error(`Unexpected seller information field "${field.fieldName}"`)
			}
		}
		console.log(formData)
		// formData.append('sellerInformation', sellerInformation);
		const response = await request(`http://localhost:${serverPort}/admin-api`, REQUEST_VERIFICATION, formData, {
			headers: {'Content-Type':'multipart/form-data', 'Authorization': `Bearer ${adminClient.getAuthToken()}`},
		});
		expect(response.data.requestVerification.success).toBe(true);
	})

	it('Should request verification', async()=>{
		let sellerInformation={};
		const someGeneralText= "Hi There!";
		const someGeneralNumber=100;
		const filename= "test-file.png"
		const fs= require('fs');
		const filePath = path.join(__dirname, filename);
  		// const formData = new FormData();
  		// formData.append('file', fileContent);
		for(let field of sellerInformationFields){
			if(field.fieldType === "file"){
				sellerInformation[field.fieldName] =  {createReadStream: fs.createReadStream(filePath), filename, mimetype: "image/png",  encoding: 'stream',}
			}
			else if(field.fieldType === "number"){
				//some general text
				sellerInformation[field.fieldName] = someGeneralNumber;
			}
			else if(field.fieldType === "text"){
				//some general text
				sellerInformation[field.fieldName] = someGeneralText;
			}else{
				throw new Error(`Unexpected seller information field "${field.fieldName}"`)
			}
		}
		const YOUR_GRAPHQL_ENDPOINT=`http://localhost:${serverPort}/admin-api`;
		const httpLink = createHttpLink({
			uri: YOUR_GRAPHQL_ENDPOINT, // Replace with your GraphQL endpoint
		  });
	  
		  // Use the `createUploadLink` to support file uploads
		  const uploadLink = createUploadLink({
			uri: YOUR_GRAPHQL_ENDPOINT, // Replace with your GraphQL endpoint
		  });
	  
		  // Combine the upload link with an authentication link if needed
		  const authLink = setContext((_, { headers }) => {
			// Add your authentication logic here
			return {
			  headers: {
				...headers,
				// 'Content-Type': 'multipart/form-data',
				'Content-Type': 'application/json',
				authorization: `Bearer  ${adminClient.getAuthToken()}`, // Add your authentication token if required
			  },
			};
		  });
	  
		  // Create the Apollo Client
		  const apolloClient = new ApolloClient({
			link: ApolloLink.from([authLink, uploadLink, httpLink]),
			cache: new InMemoryCache(),
		  });
		  const response = await apolloClient.mutate({
			mutation: gql(REQUEST_VERIFICATION),
			variables: {
				sellerInformation,
				sellerId: verificationRequesteeSellerId
			},
		  });
		  expect(response.data.requestVerification.success).toBe(true);
	})

	it.skip('Should request verification', async()=>{
		let sellerInformation={};
		const someGeneralText= "Hi There!";
		const someGeneralNumber=100;
		const filename= "test-file.png"
		const fs = require('fs').promises;
		const filePath = path.join(__dirname, filename);
		// const fileContent = fs.readFileSync(filePath);
		// const boundary = generateBoundary();
  		// const formData = new FormData();
		for(let field of sellerInformationFields){
			if(field.fieldType === "file"){
				sellerInformation[field.fieldName] = await fs.open(filePath)
				// formData.append(field.fieldName,  fs.readFileSync(filePath));
			}
			else if(field.fieldType === "number"){
				//some general text
				sellerInformation[field.fieldName] = someGeneralNumber;
				// formData.append(field.fieldName,  `${someGeneralNumber}`);
			}
			else if(field.fieldType === "text"){
				//some general text
				sellerInformation[field.fieldName] = someGeneralText;
				// formData.append(field.fieldName,  `${someGeneralText}`);
			}else{
				throw new Error(`Unexpected seller information field "${field.fieldName}"`)
			}
		}
		const YOUR_GRAPHQL_ENDPOINT=`http://localhost:${serverPort}/admin-api`;
		const boundary= generateBoundary()
		// const headers = formData.getHeaders();
		// const boundary = headers['content-type'].split('boundary=')[1];
		const json= addBoundaries(sellerInformation, boundary);
		console.log(json)
		const payload = {
			method: 'POST',
			headers: {
			  // Include any required headers here
			  // For file uploads, set Content-Type to "multipart/form-data"
			  'Content-Type': `multipart/form-data; boundary=${boundary}`,
			  // 'Content-Type': `application/json`,
			  'Authorization': `Bearer  ${adminClient.getAuthToken()}`
			},
			body: JSON.stringify({
			  query: REQUEST_VERIFICATION,
			  variables:{sellerInformation: json, sellerId: verificationRequesteeSellerId },
			}),
		  };
		  try{
		  const response = await fetch(YOUR_GRAPHQL_ENDPOINT, payload);
		  const data = await response.json();
		  console.log(data,'----------------------')
		  expect(data?.requestVerification?.success).toBe(true);
		  }catch(e){ 
			console.error('Error:', e.message);
			expect(0, e.message).toBe(1);
		  }
	})

	const addBoundaries=(formData:any, boundary: string)=>{
		let body = '';

		for (const key in formData) {
			if (formData.hasOwnProperty(key)) {
				let value = formData[key];
				body += `--${boundary}\r\n`;
				body += `Content-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`;
			}
		}

		body += `--${boundary}--\r\n`;

		return body;
	}

	const generateBoundary = () => {
		return '-------------------------' + Math.random().toString(36).substring(2);
	};
});
