import express from "express";

const app = express();
app.use(express.json());

app.post("/", (req, res) => {
  console.log("Received:", req.body);
  res.status(200).send("ok");
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
