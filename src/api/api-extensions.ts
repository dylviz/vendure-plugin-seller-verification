import { gql } from "graphql-tag";

export const adminSchema = gql`
	input SetSellerVerificationStatusInput {
		sellerId: ID!
		isVerified: Boolean!
	}
	extend type Mutation {
		setSellerVerificationStatus(
			input: SetSellerVerificationStatusInput!
		): Seller!
	}
`;
