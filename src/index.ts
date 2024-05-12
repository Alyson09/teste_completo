import 'dotenv/config';
import express, { Request, Response } from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", async (req: Request, res: Response) => {
  try {
    res.send("Hello, world!");
  } catch (e: any) {
    res.send(e.sqlMessage || e.message);
  }
});

const server = app.listen(3003, () => {
  if (server) {
    console.log(`Server is running in http://localhost:3003`);
  } else {
    console.error(`Failure upon starting server.`);
  }
});
