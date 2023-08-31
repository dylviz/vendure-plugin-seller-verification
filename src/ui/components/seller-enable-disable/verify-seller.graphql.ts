import gql from "graphql-tag";

export const SET_SELLER_VERIFICATION = gql`
	mutation setSellerVerificationStatus(
		$input: SetSellerVerificationStatusInput!
	) {
		setSellerVerificationStatus(input: $input) {
			id
			customFields {
				isVerified
			}
		}
	}
`;
