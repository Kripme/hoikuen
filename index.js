import express from "express";

const app = express();
app.use(express.json());

// Pub/Sub push用
app.post("/push", (req, res) => {
  console.log("PubSub message:", JSON.stringify(req.body));

  // Pub/Subは200系を返さないと再送し続けます
  res.status(204).send();
});

// 動作確認用
app.get("/", (req, res) => {
  res.send("OK");
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
