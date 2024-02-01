import { Administrator, Channel, Role, Seller } from "@vendure/core";
import { SimpleGraphQLClient } from "@vendure/testing";
import { MutationCreateSellerArgs } from "../src/ui/generated-admin-types";
import { createSellerInput, createChannelInput, createRoleInput, createAdministratorInput } from "./create-input";
import { CREATE_SELLER, CREATE_CHANNEL, CREATE_ROLE, CREATE_ADMINISTRATOR } from "./helpers";

export async function populateAdditionalData(adminClient: SimpleGraphQLClient):Promise<[Seller[],Channel[],Role[],Administrator[]]>{
    await adminClient.asSuperAdmin();
    let sellers: Seller[] = [];
	let channels: Channel[] = [];
	let roles: Role[] = [];
    let admininstrators: Administrator[]=[]
	// create additional Sellers
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
		const { createRole: newRole } = await adminClient.query(
			CREATE_ROLE,
			{
				input: {
					...createRoleInput[roleIndex],
					channelIds: channels[roleIndex].id,
				},
			}
		);
		roles.push(newRole)
	}
	//create Administrator associated with each roles
	for(let roleIndex in roles){
		const {createAdministrator: newAdmin} =await adminClient.query(CREATE_ADMINISTRATOR,{
			input:{
				...createAdministratorInput[roleIndex],
				roleIds: [roles[roleIndex].id]
			}
		})
        admininstrators.push(newAdmin);
	}

    return [sellers,channels,roles, admininstrators]
}