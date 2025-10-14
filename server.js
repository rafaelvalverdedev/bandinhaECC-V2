// bandinhaECC/server.js
const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const fsSync = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "5mb" })); // permitir payloads maiores se necessário

// Servir arquivos estáticos da pasta "public"
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// Rota de teste simples
app.get("/ping", (req, res) => res.json({ ok: true, ts: Date.now() }));

/**
 * POST /salvar
 * Recebe body { columns: [...] }  OU { COLUMNS: [...] }
 * Gera um novo arquivo public/musicas.js com:
 *
 * const COLUMNS = [ ... ];
 *
 * Cria um backup antes de sobrescrever: public/musicas.bak.<timestamp>.js
 */
app.post("/salvar", async (req, res) => {
  try {
    // Aceita tanto { columns: [...] } quanto { COLUMNS: [...] }
    const payload = req.body;
    const columns = payload.columns ?? payload.COLUMNS ?? null;

    if (!Array.isArray(columns)) {
      return res.status(400).json({ ok: false, error: "Payload inválido. Envie { columns: [...] }." });
    }

    // Gerar conteúdo JS com identação bonita
    const fileContent = "const COLUMNS = " + JSON.stringify(columns, null, 2) + ";\n";

    const targetPath = path.join(publicDir, "musicas.js");

    // Cria backup se o arquivo já existir
    if (fsSync.existsSync(targetPath)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupPath = path.join(publicDir, `musicas.bak.${timestamp}.js`);
      await fs.copyFile(targetPath, backupPath);
      console.log(`Backup criado em: ${backupPath}`);
    }

    // Escreve em arquivo (sobrescreve)
    await fs.writeFile(targetPath, fileContent, "utf8");
    console.log(`musicas.js atualizado em ${targetPath}`);

    return res.json({ ok: true, message: "Arquivo salvo com sucesso." });
  } catch (err) {
    console.error("Erro ao salvar musicas.js:", err);
    return res.status(500).json({ ok: false, error: "Erro interno ao salvar arquivo." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Servidor iniciado -> http://localhost:${PORT}`);
  console.log(`Servindo pasta: ${publicDir}`);
});
