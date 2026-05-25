# 🚀 Aura App API

API responsável por gerenciar a lógica do sistema de gamificação baseado em times, tarefas e pontuação (aura).

A proposta do projeto é transformar atividades do dia a dia (ou não 👀) em um sistema competitivo/cooperativo onde usuários podem ganhar pontos, subir de nível e desbloquear conquistas.

---

# 🧠 Conceito do Projeto

* Usuários podem criar ou participar de **times**
* Cada time possui membros e um ou mais **Bosses**
* Bosses podem criar e gerenciar **tarefas**
* Usuários executam tarefas e ganham (ou perdem) **aura**
* O progresso gera **badges/conquistas**

---

# 🏗️ Stack

* **Backend:** NestJS
* **Banco de Dados:** MongoDB (Atlas ou local)
* **ORM:** Mongoose
* **Autenticação:** JWT
* **Frontend:** React Native (Expo)

---

# 📁 Arquitetura do Projeto

Estrutura baseada em **feature-first (por domínio)**:

```
src/
├── auth/
├── users/
├── teams/
├── team-members/
├── tasks/
├── aura/
├── badges/
├── common/
├── database/
docs/
├── teams-members.md
```

---

# 📚 Documentação

* [Times e membros](docs/teams-members.md) — módulo `team-members`, CRUD de vínculos, join, papéis (`boss` / `member`) e como testar

---

# 🧩 Modelagem de Dados

## 👤 User

Representa um usuário do sistema.

* name
* email
* password
* aura (cache)
* isActive

---

## 👥 Team

Representa um grupo de usuários.

* name
* invite_code
* created_by

---

## 🤝 TeamMember

Relaciona usuários a times.

* userId
* teamId
* role (member | boss)

---

## 📋 Task

Tarefas dentro de um time.

* title
* description
* auraReward
* penaltyAura
* deadline
* status
* createdBy
* assignedTo[]

---

## ✅ TaskExecution

Execução real de uma tarefa.

* taskId
* userId
* status (pending_review, approved, rejected)
* proof
* reviewedBy

---

## ⚡ AuraLog

Histórico de pontuação.

* userId
* teamId
* amount
* reason

---

## 🏅 Badge

Conquistas do sistema.

* name
* icon
* description
* condition

---

## 🎖️ UserBadge

Badges desbloqueados por usuários.

* userId
* badgeId
* unlockedAt

---

# 🗄️ Banco de Dados

## Setup com Docker

```bash
docker-compose up -d
docker ps
```

---

## Variáveis de Ambiente

Crie um `.env`:

```bash
cp .env.example .env
```

Exemplo:

```env
MONGODB_URI=mongodb://admin:password@localhost:27017/api_db?authSource=admin
PORT=8080
JWT_SECRET=your_secret_here
```

---

## 📡 DatabaseModule

* Conexão centralizada com MongoDB
* Retry automático (5 tentativas)
* Logs de conexão

---

## ⚠️ Tratamento de Erros

Filtro global:

* 400 → erro de validação
* 409 → chave duplicada
* 503 → erro de conexão

---

# ▶️ Como rodar o projeto

## Instalar dependências

```bash
npm install
```

---

## Rodar em desenvolvimento

```bash
npm run start:dev
```

---

## Produção

```bash
npm run start:prod
```

---

# 🧪 Testes

```bash
npm run test
npm run test:e2e
npm run test:cov
```

---

# 🔐 Autenticação

Baseada em JWT:

* Login retorna token
* Rotas protegidas via guard
* Decorators:

  * `@Auth()`
  * `@Public()`

---

# 📌 Regras de Negócio Importantes

* Apenas **Bosses** podem revisar tarefas
* Aura não deve ser alterada diretamente (usar **AuraLog**)
* Execução de tarefas passa por **validação**
* Badges são desbloqueados com base em regras

---

# ⚡ Boas Práticas Aplicadas

* Separação por domínio (feature-based)
* Uso de referências (ObjectId) para escalabilidade
* Histórico de eventos (AuraLog, TaskExecution)
* Evitar documentos gigantes (sem arrays grandes embutidos)

---

# 🚀 Roadmap

* [ ] Sistema de ranking por time
* [ ] Eventos e desafios semanais
* [ ] Sistema de níveis
* [ ] Notificações push
* [ ] Integração com mídia (provas de tarefas)

---

# 🤝 Contribuição

Sinta-se livre para abrir issues ou PRs.

---

# 📄 Licença

MIT
