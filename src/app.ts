import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

const app = express();
const port = 3000;

app.use(express.json());

interface Submission {
  name: string;
  email: string;
  phone: string;
  github_link: string;
  stopwatch_time: string;
}

const DB_PATH = path.join(__dirname, "db.json");

function readDB(): Submission[] {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
    return [];
  }
  const data = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(data);
}

function writeDB(submissions: Submission[]): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(submissions, null, 2));
}

app.get("/ping", (req: Request, res: Response) => {
  res.json(true);
});

app.post("/submit", (req: Request, res: Response) => {
  const { name, email, phone, github_link, stopwatch_time } = req.body;

  if (!name || !email || !phone || !github_link || !stopwatch_time) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const newSubmission: Submission = {
    name,
    email,
    phone,
    github_link,
    stopwatch_time,
  };

  const submissions = readDB();
  submissions.push(newSubmission);
  writeDB(submissions);

  res.status(201).json({ message: "Submission saved successfully" });
});

app.get("/read", (req: Request, res: Response) => {
  const index = parseInt(req.query.index as string);

  if (isNaN(index) || index < 0) {
    return res.status(400).json({ error: "Invalid index" });
  }

  const submissions = readDB();

  if (index >= submissions.length) {
    return res.status(404).json({ error: "Submission not found" });
  }

  res.json(submissions[index]);
});

app.delete("/delete/:index", (req: Request, res: Response) => {
  const index = parseInt(req.params.index);

  if (isNaN(index) || index < 0) {
    return res.status(400).json({ error: "Invalid index" });
  }

  const submissions = readDB();

  if (index >= submissions.length) {
    return res.status(404).json({ error: "Submission not found" });
  }

  submissions.splice(index, 1);
  writeDB(submissions);

  res.json({ message: "Submission deleted successfully" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
