require('dotenv').config();
const app = require('./src/app');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Criar diretório de uploads se não existir
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📁 Uploads salvos em: ${uploadDir}`);
});
