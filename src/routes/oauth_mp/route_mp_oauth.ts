import { FastifyInstance } from "fastify";
import OAuthController from "../../modules/oauth_mp/controller/oauth_mp_controller";

async function oauthRoutes(app: FastifyInstance) {
  const oauthController = new OAuthController();

  app.get("/oauth/redirect", async (request, reply) => {
    return oauthController.redirectToAuth(request, reply);
  });

  app.get("/oauth/callback", async (request, reply) => {
    return oauthController.handleCallback(request, reply)
  });
}

export default oauthRoutes;
