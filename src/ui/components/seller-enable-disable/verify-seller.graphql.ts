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

export const GET_SELLER_DETAIL = gql`
    query GetSellerDetail($id: ID!) {
        seller(id: $id) {
            ...GetSellerDetail
        }
    }
    fragment GetSellerDetail on Seller {
        id
        createdAt
        updatedAt
        name
		information
		customFields{
			isVerified
			requestesVerification
			information
		}
    }
`;

;

export const GET_ACTIVE_CHANNEL = gql`
    query GetActiveChannel {
       activeChannel {
			id
			code
			token
			seller{
				id
				name
				customFields{
					isVerified
					requestesVerification
					information
				}
			}
		}
    }
`;

export const REQUEST_VERIFICATION=gql`
    mutation RequestVerificationMutation($sellerInformation: JSON!, $sellerId: ID!){
        requestVerification(sellerInformation: $sellerInformation, sellerId: $sellerId){
            success
        }
    }
`