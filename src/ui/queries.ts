import {gql} from 'graphql-tag';
import {SELLER_FRAGMENT} from '@vendure/admin-ui/core'
export const GET_SELLER_INFORMATION_FIELDS=gql`
    query GetSellerInformationFieldsQuery{
        getSellerInformationFields{
            fieldName
            fieldType
        }
    }
`;
export const VERIFY_SELLER_MUTATION=gql`
    mutation VerifySellerMutation($id: ID!){
        updateSeller(input:{id: $id, customFields:{isVerified: true, requestesVerification: false}}){
            ...Seller
        }
    }
    ${SELLER_FRAGMENT}
`