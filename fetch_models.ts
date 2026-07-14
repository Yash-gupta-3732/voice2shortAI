import * as dotenv from "dotenv";
import { writeFileSync } from "fs";
dotenv.config({ path: ".env.local" });

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
fetch(url)
  .then(res => res.json())
  .then(data => {
    writeFileSync("models.json", JSON.stringify(data, null, 2));
    console.log("Saved models to models.json");
  })
  .catch(console.error);
