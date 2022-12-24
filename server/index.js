const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Configuration, OpenAIApi } = require("openai");

// dotenv configuration
dotenv.config();

// openai configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// app configuration
const app = express();
const PORT = process.env.PORT || 5000;

// MiddleWare
app.use(cors());
app.use(express.json());

// Route
app.get("/", (req, res) => {
  res.send("<h1>Server Running</h1>");
});

app.post("/ask/me/anything", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${prompt}`,
      temperature: 0,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });

    res.status(200).json({
      bot: response.data.choices[0].text,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});


// server listen
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
