import { randomUUID } from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../../prisma";
import OAuthService from "../service/oauth_mp_service";

class OAuthController {
  private oauthService: OAuthService;

  constructor() {
    const clientId = process.env.MERCADO_PAGO_CLIENT_ID!;
    const clientSecret = process.env.MERCADO_PAGO_CLIENT_SECRET!;
    const redirectUri = process.env.MERCADO_PAGO_REDIRECT_URI!;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Missing required environment variables for MercadoPago OAuth");
    }

    this.oauthService = new OAuthService(clientId, clientSecret, redirectUri);
  }

  /**
   * Redirecionar para o MercadoPago para autenticação
   */
  async redirectToAuth(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.query as { userId: string };

      if (!userId) {
        return reply.status(400).send({ error: "Missing userId in request body" });
      }

      const state = randomUUID();
      const codeVerifier = this.oauthService.generateCodeVerifier();
      const codeChallenge = await this.oauthService.generateCodeChallenge(codeVerifier);

      // Salve o codeVerifier no banco de dados, associado ao userId (ou state)
      await prisma.mercadoPagoSession.create({
        data: {
          userId,
          state,
          codeVerifier,
        },
      });

      const authUrl = this.oauthService.getAuthUrl(state, codeChallenge);

      return reply.status(200).send({ authUrl });
    } catch (error) {
      console.error("Error generating auth URL:", error);
      return reply.status(500).send({ error: "Failed to generate auth URL" });
    }
  }

  /**
   * Callback do MercadoPago para processar o código de autorização
   */
  async handleCallback(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { code, state } = request.query as { code: string; state: string };

      if (!code || !state) {
        return reply.status(400).send({ error: "Missing code or state in query parameters" });
      }

      // Encontre a sessão correspondente ao state
      const session = await prisma.mercadoPagoSession.findUnique({
        where: { state },
      });

      if (!session) {
        return reply.status(404).send({ error: "Session not found for the given state" });
      }

      console.log("Exchanging code for tokens...");

      const tokenResponse = await this.oauthService.getAccessToken(code, session.codeVerifier);

      await prisma.mercadoPagoToken.create({
        data: {
          userId: session.userId,
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
        },
      });

      await prisma.mercadoPagoSession.delete({
        where: { state }
      });

      return reply.status(200).send(tokenResponse);
    } catch (error: any) {
      console.error("Error handling callback:", error.message);
      return reply.status(500).send({ error: "Failed to handle callback" });
    }
  }

  /**
   * Renovar o Access Token usando o Refresh Token
   */
  async refreshAccessToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.body as { userId: string };

      if (!userId) {
        return reply.status(400).send({ error: "Missing userId in request body" });
      }

      const userToken = await prisma.mercadoPagoToken.findUnique({ where: { userId } });

      if (!userToken || !userToken.refreshToken) {
        return reply.status(404).send({ error: "User token or refresh token not found" });
      }

      const tokenResponse = await this.oauthService.refreshAccessToken(userToken.refreshToken);

      await prisma.mercadoPagoToken.update({
        where: { userId },
        data: {
          accessToken: tokenResponse.access_token,
          expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
        },
      });

      return reply.status(200).send(tokenResponse);
    } catch (error: any) {
      console.error("Error refreshing access token:", error.message);
      return reply.status(500).send({ error: "Failed to refresh access token" });
    }
  }
}

export default OAuthController;
