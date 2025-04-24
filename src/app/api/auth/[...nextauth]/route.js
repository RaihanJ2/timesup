import User from "@/app/models/User";
import dbConnect from "@/app/utils/dbConnect";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Extract the configuration into a separate authOptions object
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      await dbConnect();
      let user = await User.findOne({ googleId: token.sub });

      if (!user) {
        user = await User.create({
          googleId: token.sub,
          email: token.email,
          name: token.name,
        });
      }

      if (session?.user) {
        session.user.id = user?.id || token?.sub;
      }
      return session;
    },
  },
  async jwt({ token, account, profile }) {
    if (account) {
      token.googleId = profile.sub;
    }
    return token;
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Pass the authOptions to NextAuth
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
