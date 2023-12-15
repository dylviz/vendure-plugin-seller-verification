import { gql } from "graphql-tag";

export const adminSchema = gql`
	input SetSellerVerificationStatusInput {
		sellerId: ID!
		isVerified: Boolean!
	}

	input SetBulkSellerVerificationStatusInput {
		sellerIds: [ID!]!
		areVerified: Boolean!
	}
	extend type Mutation {
		setSellerVerificationStatus(
			input: SetSellerVerificationStatusInput!
		): Seller

		setBulkSellerVerificationStatus(
			input: SetBulkSellerVerificationStatusInput!
		): Success
	}
`;
