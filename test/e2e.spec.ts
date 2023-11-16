import { DefaultLogger, LogLevel, mergeConfig } from '@vendure/core';
import {
  createTestEnvironment,
  registerInitializer,
  SimpleGraphQLClient,
  SqljsInitializer,
  testConfig,
} from '@vendure/testing';
import { TestServer } from '@vendure/testing/lib/test-server';
import { expect, describe, beforeAll, afterAll, it } from 'vitest';
import {SellerVerifyPlugin} from '../src'
import { testPaymentMethod } from './test-payment-method';
import { initialTestData } from './initial-test-data';
import {CreateSellerInput,Seller, MutationCreateSellerArgs} from '@vendure/common/lib/generated-types';
import createSellersInputs from './create-seller-input';
import {gql} from 'graphql-tag';

describe('Sort by Popularity Plugin', function () {
  let server: TestServer;
  let adminClient: SimpleGraphQLClient;
  let shopClient: SimpleGraphQLClient;
  let serverStarted = false;
  let sellers: Seller[]=[];
  let sellerVerfifcationStatusQuery=gql`
    mutation SetSellerVerificationStatus($input: SetSellerVerificationStatusInput!){
        setSellerVerificationStatus(
			input: $input
		){
            id
            name
            customFields{
                isVerified
              }
        }
    }
  `
  beforeAll(async () => {
    registerInitializer('sqljs', new SqljsInitializer('__data__'));
        const config = mergeConfig(testConfig, {
            apiOptions: {
                port: 3106,
            },
            logger: new DefaultLogger({ level: LogLevel.Debug }),
            plugins: [
                SellerVerifyPlugin,
            ],
            paymentOptions: {
                paymentMethodHandlers: [testPaymentMethod],
            },
        });
        ({ server, adminClient, shopClient } = createTestEnvironment(config));
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
        productsCsvPath: './test/products.csv',
        customerCount: 2,
        });
        serverStarted = true;
        await adminClient.asSuperAdmin();
    })

    it('Should create sellers',async()=>{
        for(let createSellerInput of createSellersInputs){
            const {createSeller: newSeller}= await adminClient.query<{createSeller: Seller},MutationCreateSellerArgs>(gql`
            mutation CreateSellerMutation($input:  CreateSellerInput!){
                createSeller(input:$input){
                  id
                  name
                }
              }
            `,{input: {name: createSellerInput.name}})
            expect(newSeller.name).toBe(createSellerInput.name)
            sellers.push(newSeller);
        }
    })

    it('Should verify sellers', async()=>{
        const {setSellerVerificationStatus: updatedSeller} = await adminClient.query(
            sellerVerfifcationStatusQuery,{input: {sellerId: sellers[0].id, isVerified: true}})
        expect(updatedSeller.id).toBe(sellers[0].id);
        expect(updatedSeller.customFields.isVerified).toBe(true);
    })

    it.skip('Should revoke selller permisiion', async()=>{
    
    })
})