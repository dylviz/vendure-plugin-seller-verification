import { Channel, DefaultLogger, LogLevel, Role, mergeConfig } from '@vendure/core';
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
import {Seller, MutationCreateSellerArgs} from '@vendure/common/lib/generated-types';
import {createSellerInput,createChannelInput,createRoleInput} from './create-input';
import {gql} from 'graphql-tag';
import { additionalPermissions } from '../src/service/sellerverify.service';

describe('Seller Verifcation Plugin', function () {
  let server: TestServer;
  let adminClient: SimpleGraphQLClient;
  let sellers: Seller[]=[];
  let channels: Channel[]=[];
  let roles:Role[]=[];
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
        productsCsvPath: './test/products.csv',
        customerCount: 2,
        });
        await adminClient.asSuperAdmin();
        //create additional Seller
        for(let sellerInfo of createSellerInput){
            const {createSeller: newSeller}= await adminClient.query<{createSeller: Seller},MutationCreateSellerArgs>(gql`
            mutation CreateSellerMutation($input:  CreateSellerInput!){
                createSeller(input:$input){
                  id
                  name
                }
              }
            `,{input: {name: sellerInfo.name}})
            sellers.push(newSeller);
        }
        //create additional Channel associated with new Seller
        for(let createChannelIndex in createChannelInput){
            const {createChannel: newChannel}= await adminClient.query(gql`
            mutation CreateChannelQuery($input: CreateChannelInput!){
                createChannel(input: $input){
                    ... on Channel{
                        code
                        id
                      }
                }         
            }     
            `,{input: {...createChannelInput[createChannelIndex], sellerId: sellers[createChannelIndex].id}})
            channels.push(newChannel)
        }
        //Create Role associated with the new Channel
        for(let roleIndex in createRoleInput){
            const {createRole} =await adminClient.query(gql`
            mutation CreateRoleMutation($input: CreateRoleInput!){
                createRole(input: $input){
                    id
                    code
                    description
                    permissions
                }
            }
            `,{input: {...createRoleInput[roleIndex], channelIds: channels[roleIndex].id}})
            roles.push(createRole);
        }
    })

    it('Should verify sellers', async()=>{
        const {setSellerVerificationStatus: updatedSeller} = await adminClient.query(
            sellerVerfifcationStatusQuery,{input: {sellerId: sellers[0].id, isVerified: true}})
        expect(updatedSeller.id).toBe(sellers[0].id);
        expect(updatedSeller.customFields.isVerified).toBe(true);
    })

    it('Should assign additional permisions to verified sellers', async()=>{
        const verifiedSellerRole= roles[0];
        const {role:updatedRole}= await adminClient.query(
            gql`
            query GetRoleQuery($id: ID!){
                role(id: $id){
                    id
                    code
                    description
                    permissions
                }
              }
            `,{id: parseInt(verifiedSellerRole.id.toString().split('_')[1])}
        )
        expect(updatedRole.id).toBe(verifiedSellerRole.id);
        for(let permission of [...additionalPermissions,...createRoleInput[0].permissions]){
            expect(updatedRole.permissions).toContain(permission)
        }
    })

    it('Should revoke selller permisiion', async()=>{
        const {setSellerVerificationStatus: updatedSeller} = await adminClient.query(
            sellerVerfifcationStatusQuery,{input: {sellerId: sellers[0].id, isVerified: false}})
        expect(updatedSeller.id).toBe(sellers[0].id);
        expect(updatedSeller.customFields.isVerified).toBe(false);
    })

    it('Should remove additional Permissions from sellers whose verification status has been revoked', async()=>{
        const unverifiedSellerRole= roles[0];
        const {role:updatedRole}= await adminClient.query(
            gql`
            query GetRoleQuery($id: ID!){
                role(id: $id){
                    id
                    code
                    description
                    permissions
                }
              }
            `,{id: parseInt(unverifiedSellerRole.id.toString().split('_')[1])}
        )
        expect(updatedRole.id).toBe(unverifiedSellerRole.id);
        for(let permission of additionalPermissions){
            expect(updatedRole.permissions).not.toContain(permission)
        }
        for(let permission of createRoleInput[0].permissions){
            expect(updatedRole.permissions).toContain(permission)
        }
    })
})