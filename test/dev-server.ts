import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import {
  DefaultLogger,
  DefaultSearchPlugin,
  LogLevel,
  mergeConfig,
} from '@vendure/core';
import {
  createTestEnvironment,
  registerInitializer,
  SqljsInitializer,
  testConfig,
} from '@vendure/testing';
import { initialTestData } from './initial-test-data';
import { SellerVerifyPlugin } from '../src';
import { compileUiExtensions } from '@vendure/ui-devkit/compiler';
import path from 'path';
import { createChannelInput, createRoleInput, createSellerInput } from './create-input';
import { Channel, MutationCreateSellerArgs, Seller } from '../src/ui/generated-admin-types';
import {gql} from 'graphql-tag';

require('dotenv').config();

(async () => {
  registerInitializer('sqljs', new SqljsInitializer('__data__'));
  const devConfig = mergeConfig(testConfig, {
    logger: new DefaultLogger({ level: LogLevel.Debug }),
    plugins: [
      SellerVerifyPlugin,
      DefaultSearchPlugin,
      AdminUiPlugin.init({
        port: 3002,
        route: 'admin',
        app: compileUiExtensions({
            outputPath: path.join(__dirname, '__admin-ui'),
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
    productsCsvPath: './test/products.csv',
  });
  await adminClient.asSuperAdmin();
  let sellers: Seller[]=[];
  let channels: Channel[]=[];
  // create additional Sellers
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
    await adminClient.query(gql`
    mutation CreateRoleMutation($input: CreateRoleInput!){
        createRole(input: $input){
            id
            code
            description
            permissions
        }
    }
    `,{input: {...createRoleInput[roleIndex], channelIds: channels[roleIndex].id}})
  } 
})
();