import { Amplify } from 'aws-amplify'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID, // replace with your User Pool ID
      userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID, // replace with your App Client ID
    },
  },
})
