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
	type SellerInformationField{
		fieldName: String!
		fieldType: String!
	}
	extend type Mutation {
		setSellerVerificationStatus(
			input: SetSellerVerificationStatusInput!
		): Seller

		setBulkSellerVerificationStatus(
			input: SetBulkSellerVerificationStatusInput!
		): Success

		requestVerification(sellerInformation: JSON!, sellerId: ID!): Success!
	}
	extend type Query{
		getSellerInformationFields: [SellerInformationField]!
	}
`;
