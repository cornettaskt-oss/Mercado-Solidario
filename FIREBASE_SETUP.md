# Guia de Configuração Firebase para Mercado Solidário

## ✅ Passo 1: Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em **"Criar um projeto"**
3. Preencha o nome: `Mercado-Solidario`
4. Desmarque "Ativar Google Analytics" (opcional)
5. Clique em **"Criar projeto"** e aguarde (leva alguns segundos)

## ✅ Passo 2: Ativar Firestore Database

1. No painel do projeto, clique em **"Firestore Database"** (no menu esquerdo)
2. Clique em **"Criar banco de dados"**
3. Escolha **"Iniciar no modo de teste"** (desenvolvimento)
4. Selecione localização: **"southamerica-east1"** (Brasil) ou **"us-central1"**
5. Clique em **"Criar"**

## ✅ Passo 3: Adicionar Sua Aplicação Web

1. No painel principal do projeto, clique na engrenagem ⚙️ > **"Configurações do projeto"**
2. Vá para a seção **"Seus apps"**
3. Clique em **"Adicionar app"** > selecione **Web ( </> )**
4. Dê um nome ao app: `Mercado Solidario Web`
5. Clique em **"Registrar app"**
6. Você verá um código com a configuração Firebase. **COPIE TUDO ISSO**

## ✅ Passo 4: Obter as Credenciais

Na tela de registro, você verá algo assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...seu_api_key_aqui...Xxx",
  authDomain: "seu-projeto-xxxxx.firebaseapp.com",
  projectId: "seu-projeto-xxxxx",
  storageBucket: "seu-projeto-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456ghi"
};
```

**Anote ou copie todos esses valores!**

## ✅ Passo 5: Atualizar o Arquivo index.html

1. Abra o arquivo `index.html` no seu editor (VS Code, etc.)
2. Procure pela seção Firebase (logo após `<link rel="stylesheet" href="styles.css">`)
3. Você verá:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

4. **Substitua os valores `YOUR_...` pelos valores que você copiou do Firebase**

### Exemplo (NÃO COPIE, USE SEUS VALORES):
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyD_1234567890abcdefghijklmnopqr",
    authDomain: "mercado-solidario-app.firebaseapp.com",
    projectId: "mercado-solidario-app",
    storageBucket: "mercado-solidario-app.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456ghi789"
};
```

5. **Salve** o arquivo (`Ctrl+S`)

## ✅ Passo 6: Configurar Regras de Segurança

1. No Firebase Console, vá para **"Firestore Database"** > **"Regras"**
2. Apague o código padrão e **copie e cole isto:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Clique em **"Publicar"**

**⚠️ Nota:** Isto é apenas para desenvolvimento/teste. Para produção, restrinja com autenticação.

## ✅ Passo 7: Fazer Push (Atualizar o Site)

1. Abra o **PowerShell** ou **Terminal** na pasta do projeto
2. Execute:
   ```
   git add .
   git commit -m "Configura Firebase com credenciais do projeto"
   git push origin main
   ```

3. Aguarde o Netlify fazer o deploy (1-5 minutos)

## ✅ Passo 8: Testar no App

1. Acesse [https://cadastromercado-solidario.netlify.app/](https://cadastromercado-solidario.netlify.app/)
2. **No desktop:** Faça um cadastro completo e finalize
3. **No celular:** Abra o mesmo link, vá para Admin e veja se o cadastro aparece
4. **No celular:** Faça um novo cadastro
5. **No desktop:** Vá para Admin e veja se aparecem os dados do celular

Se tudo aparecer sincronizado = **FUNCIONANDO! 🎉**

## 🔧 Troubleshooting

### App não carrega / Erro de Firestore
- Verifique se as credenciais estão corretas no `index.html`
- Abra o Console do navegador (`F12` > Console) e procure por erros
- Certifique-se de que o Firestore foi criado e está ativo

### Dados não sincronizam
- Verifique conexão de internet em ambos os dispositivos
- Limpe o cache do navegador (`Ctrl+Shift+Delete`)
- Verifique se o Firestore está recebendo dados (Firebase Console > Firestore > Dados)

### Erro de permissão ou CORS
- Revise as regras de segurança (Passo 6)
- Certifique-se de que estão publicadas (botão "Publicar")

## 📞 Precisa de Ajuda?

Se tiver dúvidas em algum passo, me chame! Estou aqui para ajudar.
