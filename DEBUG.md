# 🐛 Debug - Correção de Bugs da IA

## Problemas Comuns e Soluções

### 1. ❌ "IA não responde / Erro 500"

**Causa**: Dependências não instaladas

**Solução**:
```bash
npm install
```

Se o erro persistir, remova a pasta `node_modules` e reinstale:
```bash
rmdir /s /q node_modules
npm install
```

---

### 2. ❌ "Erro ao processar comando"

**Causa**: Backend não está rodando ou erro na API

**Verificar**:
1. Certifique-se de que o backend está rodando na porta 3000
2. Abra http://localhost:3000 no navegador
3. Veja se aparece "Cannot GET /"

**Solução**:
```bash
# Parar o servidor atual (Ctrl+C)
# Reiniciar
npm run dev
```

**Verificar logs do servidor**:
- Deve aparecer: "🚀 Servidor rodando em http://localhost:3000"
- Deve aparecer: "🤖 Agente de IA ativado"

---

### 3. ❌ "Microfone não funciona"

**Causa**: Permissões do navegador ou navegador incompatível

**Solução**:
1. Use **Chrome** (recomendado) ou **Edge**
2. Permita acesso ao microfone quando solicitado
3. Verifique configurações de privacidade do navegador

**Testar microfone**:
1. Abra configurações do Chrome
2. Vá em Privacidade > Configurações de site > Microfone
3. Certifique-se de que localhost está permitido

---

### 4. ❌ "CORS Error" no console

**Causa**: Backend e frontend em portas diferentes sem CORS configurado

**Verificar**: O arquivo `server/index.js` deve ter:
```javascript
import cors from 'cors';
app.use(cors());
```

**Já está implementado** ✅

---

### 5. ❌ "404 Not Found /api/ai/process"

**Causa**: Rota não registrada ou servidor não reiniciado

**Solução**:
1. Pare o servidor (Ctrl+C)
2. Reinicie com `npm run dev`
3. Verifique se o arquivo `server/index.js` tem a rota:
```javascript
app.post('/api/ai/process', async (req, res) => { ... });
```

---

### 6. ❌ "Cannot read property 'processCommand' of undefined"

**Causa**: Importação incorreta do aiService

**Verificar**:
```javascript
// server/index.js
import aiAgent from './aiService.js';  // ✅ Correto
```

---

### 7. ❌ "Transcript vazio / não detecta voz"

**Causa**: Problemas com Web Speech API

**Solução**:
1. Fale mais alto e claramente
2. Reduza ruído ambiente
3. Verifique se o microfone está selecionado corretamente
4. Teste em uma aba anônima (pode ser extensão interferindo)

---

### 8. ❌ "IA responde mas não navega"

**Causa**: useNavigate do React Router não está funcionando

**Verificar**: O componente VoiceAgent deve estar dentro do Router:
```jsx
<Router>
  <Navigation />
  <Routes>...</Routes>
  <VoiceAgent />  {/* ✅ Dentro do Router */}
</Router>
```

**Já está implementado** ✅

---

### 9. ❌ "Confiança sempre 0%"

**Causa**: Resposta da API não inclui `confidence`

**Verificar**: O aiService deve retornar:
```javascript
return {
  action: 'navigate',
  route: '/',
  response: 'Abrindo dashboard',
  confidence: 0.95  // ✅ Deve ter esse campo
};
```

**Já está implementado** ✅

---

### 10. ❌ "Voz não fala (mudo)"

**Causa**: Speech Synthesis desativado ou não suportado

**Solução**:
1. Verifique se o botão do alto-falante está verde (ativado)
2. Aumente o volume do sistema
3. Teste em outra aba se funciona
4. Verifique console do navegador (F12)

---

## 🔧 Comandos de Debug

### Verificar se tudo está instalado:
```bash
npm list
```

### Limpar cache e reinstalar:
```bash
npm cache clean --force
rmdir /s /q node_modules
npm install
```

### Verificar portas em uso:
```bash
netstat -ano | findstr :3000
netstat -ano | findstr :5173
```

### Reiniciar servidor com logs:
```bash
npm run dev
```

---

## 📝 Checklist de Verificação

Antes de reportar um bug, verifique:

- [ ] Backend está rodando (porta 3000)
- [ ] Frontend está rodando (porta 5173)
- [ ] Navegador é Chrome ou Edge
- [ ] Permissões de microfone concedidas
- [ ] Console do navegador não mostra erros (F12)
- [ ] Dependências instaladas (`npm install`)
- [ ] Não há outros servidores rodando nas mesmas portas

---

## 🐛 Reportar Bug

Se o problema persistir, forneça:

1. **Mensagem de erro exata** (copie do console)
2. **Navegador e versão** (ex: Chrome 120)
3. **Sistema operacional** (ex: Windows 11)
4. **Comando que você tentou** (ex: "Quantos veículos?")
5. **O que aconteceu** vs **O que esperava**

---

## 🔍 Verificação Rápida

### Teste 1: Backend Funcionando
```bash
curl http://localhost:3000/api/dashboard
```
Deve retornar JSON com dados

### Teste 2: IA Endpoint
```bash
curl -X POST http://localhost:3000/api/ai/process \
  -H "Content-Type: application/json" \
  -d "{\"command\":\"quantos veiculos\"}"
```
Deve retornar resposta da IA

### Teste 3: Frontend
Abra http://localhost:5173
- Deve carregar a página
- Deve mostrar navegação
- Deve ter botão de microfone no canto inferior direito

---

## ✅ Tudo Funcionando?

Se todos os testes passarem mas ainda há problemas:
1. Limpe o cache do navegador (Ctrl+Shift+Del)
2. Abra em aba anônima
3. Tente outro navegador
4. Reinicie o computador

---

**Última atualização**: 2025-10-08
