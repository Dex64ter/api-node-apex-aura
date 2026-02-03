import dotenv from "dotenv";
dotenv.config();
const PORT = parseInt(`${process.env.PORT}` || "3000");

import app from "./app.ts";

app.listen(PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

import mongoose from 'mongoose';

const MONGO_URI = "mongodb://admin:password@localhost:27017/api_db?authSource=admin";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Conectado ao MongoDB com sucesso!");
    // Inicie o app.listen aqui dentro para garantir que o banco esteja pronto
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }) 
  .catch((err) => console.error("Erro ao conectar no MongoDB:", err));