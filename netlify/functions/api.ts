import serverless from "serverless-http";
import { app } from "../../server";

// Wrap the Express app with serverless-http for Netlify Functions compatibility
const handler = serverless(app);

export { handler };
