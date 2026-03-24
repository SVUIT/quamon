import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, profile }) {
      // 👉 khi login lần đầu, profile có dữ liệu GitHub
      if (profile) {
        token.username = (profile as any).login;
      }
      return token;
    },

    async session({ session, token }) {
      // 👉 đưa username vào session
      if (session.user) {
        (session.user as any).username = token.username;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };