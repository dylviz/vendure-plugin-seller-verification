import { gql } from "graphql-tag";

export const ADMINISTRATOR_FRAGMENT = gql`
    fragment Administrator on Administrator {
        id
        firstName
        lastName
        emailAddress
        user {
            id
            identifier
            lastLogin
            roles {
                id
                code
                description
                permissions
            }
        }
    }
`;
export const GET_SELLER_INFORMATION_FIELDS=gql`
    query GetSellerInformationFieldsQuery{
        getSellerInformationFields{
            fieldName
            fieldType
        }
    }
`;

export const sellerVerfifcationStatusQuery = gql`
    mutation SetSellerVerificationStatus(
        $input: SetSellerVerificationStatusInput!
    ) {
        setSellerVerificationStatus(input: $input) {
            id
            name
            customFields {
                isVerified
            }
        }
    }
`;

export const CREATE_ROLE=gql`
    mutation CreateRoleMutation($input: CreateRoleInput!) {
        createRole(input: $input) {
            id
            code
            description
            permissions
        }
    }
`

export const CREATE_CHANNEL=gql`
    mutation CreateChannelQuery($input: CreateChannelInput!) {
        createChannel(input: $input) {
            ... on Channel {
                code
                id
            }
        }
    }
`

export const CREATE_SELLER=gql`
    mutation CreateSellerMutation($input: CreateSellerInput!) {
        createSeller(input: $input) {
            id
            name
        }
    }
`

export const GET_ROLE=gql`
    query GetRoleQuery($id: ID!) {
        role(id: $id) {
            id
            code
            description
            permissions
        }
    }
`

export const REQUEST_VERIFICATION=`
    mutation RequestVerificationMutation($sellerInformation: JSON!, $sellerId: ID!){
        requestVerification(sellerInformation: $sellerInformation, sellerId: $sellerId){
            success
        }
    }
`

export const CREATE_ADMINISTRATOR = gql`
    mutation CreateAdministrator($input: CreateAdministratorInput!) {
        createAdministrator(input: $input) {
            ...Administrator
        }
    }
    ${ADMINISTRATOR_FRAGMENT}
`;
