import NextAuth, { NextAuthOptions } from 'next-auth'
import PipedriveProvider from 'next-auth/providers/pipedrive' 
import { config } from '../../../../auth';
import { NextApiRequest, NextApiResponse } from 'next'
import { readFileSync } from 'node:fs';
import jwt from '../../../../auth';
// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options


export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    PipedriveProvider({
      clientId: process.env.PIPEDRIVE_ID ,
      clientSecret: process.env.PIPEDRIVE_SECRET,
    }),
    
  ],
  callbacks: {
    async jwt({ token }) {
      token.userRole = 'admin';
      return token;
    },
  },
};


/**
 * Handles authentication requests.
 * @param {NextApiRequest} req - The incoming request object.
 * @param {NextApiResponse} res - The outgoing response object.
 * @returns {Promise<void>} - A Promise that resolves when authentication is complete.
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  req = forceSession(req); //set session properties accessToken,refreshToken, apiDomain and  on req.session 

  return await NextAuth(req,res,config)

} 

/**
 * Forces the session to be created and populated with the user's access token and refresh token.
 * @param {NextApiRequest} req - The incoming request object.
 */
function forceSession(req: NextApiRequest) {
  // Create a session if one does not already exist. 
  //ONLY USE THIS FOR TESTING. SHOULD BE REMOVED FOR PRODUCTION ENVIRONMENT

  if (!req.headers.authorization) {
    // Set the session properties.
    const tokenHolder = JSON.parse(readFileSync("/Users/jason/dev/pdwhapp/token.json", "utf8"));
    req.headers.authorization = "Bearer " + tokenHolder.accessToken;
    jwt(tokenHolder);
    //req.headers.refresh_token = tokenHolder.refreshToken;
    //req.headers.api_domain = tokenHolder.apiDomain;
    //for each property in tokenHolder, console.log the property name and value
    for (const [key, value] of Object.entries(tokenHolder)) {
      console.log(`${key}: ${value}`);
    }
    return req;
  }
  return req;
}




export { handler as GET, handler as POST };
