import express from "express";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const app = express();
app.use(express.json({ limit: "5mb" }));

const secrets = new SecretManagerServiceClient();

async function getSecret(name) {
  const projectId = process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
  const secretName = `projects/${projectId}/secrets/${name}/versions/latest`;
  const [version] = await secrets.accessSecretVersion({ name: secretName });
  return version.payload.data.toString("utf8");
}

function decodePubsubMessage(body) {
  const data = body?.message?.data;
  if (!data) return null;
  const json = Buffer.from(data, "base64").toString("utf8");
  try {
    return JSON.parse(json);
  } catch {
    return { raw: json };
  }
}

async function postToSlack(webhookUrl, text) {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Slack webhook failed: ${res.status} ${t}`);
  }
}

app.post("/push", async (req, res) => {
  try {
    const payload = decodePubsubMessage(req.body);
    console.log("pubsub push received", payload);

    const webhookUrl = await getSecret("slack_webhook_url");
    await postToSlack(
      webhookUrl,
      `保育園ToDo bot: Pub/Sub受信\n\`\`\`${JSON.stringify(payload)}\`\`\``,
    );

    res.status(204).send();
  } catch (e) {
    console.error(e);
    // Pub/Subは2xx以外だとリトライするので、失敗時は500にして再試行させる
    res.status(500).send("error");
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server listening on ${port}`));
