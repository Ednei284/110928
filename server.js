import app from './src/app.js';
import dotenv from 'dotenv';
dotenv.config();


const PORT = process.env.PORT || 3000;

// Criar diretório de uploads se não existir

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});
