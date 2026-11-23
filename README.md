<div align="center">

# 🌱 EcoFood

**Plataforma de redistribuição de excedentes alimentares**

Conecta estabelecimentos com sobra de alimento a ONGs, abrigos e famílias — reduzindo desperdício e combatendo a fome.

[![.NET](https://img.shields.io/badge/.NET_10-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

🎯 **ODS 12** — Consumo e Produção Responsáveis &nbsp;·&nbsp; 🍽️ **ODS 2** — Fome Zero

</div>

---

## 💻 Desenvolvedores

- Caio Cesar — *QA*
- Caio Menezes — *Dev. Frontend*
- Caik Lima — *Dev. Backend*
- Luiz Henrique — *Dev. Backend*
- Marlon Bartoli — *Dev / Tester*

---

## 📖 Sobre o projeto

O EcoFood resolve um problema simples de enunciar e difícil de operacionalizar: **comida boa sendo descartada enquanto gente passa fome a poucos quarteirões de distância.**

A plataforma tem três atores:

| Ator | O que faz |
|------|-----------|
| 🏪 **Doador** | Estabelecimento com excedente (padaria, mercado, restaurante). Publica o que tem disponível. |
| 🤝 **Receptor** | ONG, abrigo ou família. Navega as doações e reserva o que consegue retirar. |
| 🛡️ **Admin** | Perfil de gestão previsto no modelo de dados. Não há tela dedicada, e o cadastro público não permite criar esse tipo. |

### A regra central: confirmação de endereço

Nenhuma reserva é criada sem que o receptor **confirme explicitamente** que viu e aceita o endereço de retirada. Essa regra vive na API — não apenas na tela:

- O campo `enderecoConfirmado` precisa chegar como `true`, senão a API devolve `400 Bad Request`.
- O endereço gravado na reserva (`EnderecoRetiradaSnapshot`) é copiado **do cadastro do doador no servidor**, nunca do que o cliente enviou. Assim o cliente não consegue registrar um endereço diferente do real.
- Só doações com status `Disponivel` podem ser reservadas, e a API valida que o `receptorId` enviado é realmente de um usuário do tipo `Receptor`.
- Marcar a doação como `Reservado` e criar a reserva acontecem dentro de uma **transação** — se um passo falhar, o outro é desfeito.

> 📌 **Uma reserva por doação** é garantida pela transição de status (`Disponivel` → `Reservado`), e não por constraint no banco. O índice único em `Reservas.DoacaoId` existiu na primeira versão e foi removido pela migration `PermitirMultiplasReservasPorDoacao`, para permitir histórico de reservas canceladas na mesma doação.

---

## 🔐 Autenticação

O acesso é por **e-mail e senha**, com token *Bearer* emitido pela API.

| Aspecto | Como funciona |
|---|---|
| Login | `POST /api/auth/login` devolve um token Bearer com validade de **1 hora** |
| Senha | Guardada apenas como hash (`PasswordHasher` do ASP.NET Core Identity). Mínimo de **8 caracteres** |
| Sessão no navegador | Token em `localStorage`, chave `ecofood.sessao`. Um `401` fora do login limpa a sessão e devolve o usuário à tela de entrada |
| Proteção contra força bruta | *Rate limiting* de **10 tentativas de login por minuto, por IP** (responde `429`) |
| Rotas do frontend | `/entrar` e `/cadastro` são públicas; todo o resto exige sessão ativa (`RotaProtegida`) |
| Menu por perfil | *Doar alimentos* aparece só para **Doador**; *Minhas reservas* só para **Receptor** |

> ⚠️ **Os usuários de exemplo do `init.sql` não têm senha cadastrada** (`SenhaHash` fica `NULL`) e por isso **não conseguem fazer login**. Para entrar no sistema pela primeira vez, crie uma conta na tela **Cadastro**. Os dados de exemplo continuam úteis como doadores/doações visíveis na listagem.

---

## 🧩 Submódulos

Este repositório é um **agregador**: o código vive em dois repositórios separados, incluídos aqui como submódulos Git.

| Pasta | Repositório | Conteúdo |
|---|---|---|
| `EcoFood_Api/` | [EcoFood-Backend](https://github.com/devCaio00/EcoFood-Backend) | API ASP.NET Core + scripts do banco |
| `EcoFood.Web/` | [EcoFood-Frontend](https://github.com/devCaio00/EcoFood-Frontend) | Interface React + Vite |

Clone **com** os submódulos:

```bash
git clone --recurse-submodules https://github.com/devCaio00/EcoFood.git
cd EcoFood
```

Já clonou sem eles? As pastas aparecem vazias — preencha com:

```bash
git submodule update --init --recursive
```

### Atualizando os submódulos

O repositório raiz aponta para um **commit fixo** de cada submódulo. Para trazer o que há de mais novo nos dois sub-repos e registrar isso aqui:

```bash
git submodule update --remote --merge
git add EcoFood_Api EcoFood.Web
git commit -m "chore: atualiza ponteiros dos submodulos"
```

> 💡 Sem esse passo, quem clonar este repositório recebe a versão dos submódulos registrada no último commit — que pode ser bem anterior ao estado atual do backend e do frontend. Se o sistema não bater com o que está documentado aqui, rode `git submodule status` e compare com os commits mais recentes dos sub-repos.

---

## 🧰 Stack

### Backend

| | Tecnologia | Versão | Papel |
|---|---|---|---|
| 🟣 | **.NET / ASP.NET Core** | 10.0 | API REST |
| 🗃️ | **Entity Framework Core** | 9.0.13 | ORM e migrations |
| 🐬 | **Pomelo.EntityFrameworkCore.MySql** | 9.0.0 | Provider MySQL para o EF |
| 🔑 | **ASP.NET Core Identity** (`PasswordHasher`) | *built-in* | Hash de senha |
| 🚦 | **Rate Limiting** (`Microsoft.AspNetCore.RateLimiting`) | *built-in* | Limite de tentativas de login |
| 📘 | **Swashbuckle (Swagger)** | 10.3.1 | Documentação interativa da API |
| 🧪 | **xUnit** | 2.9.3 | Testes de unidade e integração |
| 🧪 | **EF Core InMemory + Mvc.Testing** | 9.0.13 / 10.0.13 | Testes sem banco real |

### Frontend

| | Tecnologia | Versão | Papel |
|---|---|---|---|
| ⚛️ | **React** | 19.3.1 | Interface |
| ⚡ | **Vite** | 8.3.4 | Build e dev server |
| 🔷 | **TypeScript** | 6.0 | Tipagem estática |
| 🎨 | **Tailwind CSS** | 3.4.13 | Estilização |
| 🧭 | **React Router** | 7.18.4 | Navegação e rotas protegidas |
| 🔄 | **TanStack Query** | 5.56.2 | Cache e sincronização de dados |
| 📡 | **Axios** | 1.7.7 | Cliente HTTP (injeta o token Bearer) |
| 🧪 | **Vitest + Testing Library** | 5.0.5 | Testes de componente |

### Banco de dados

| | Tecnologia | Papel |
|---|---|---|
| 🐬 | **MySQL 8** | Persistência (`utf8mb4`, InnoDB) |

---

## 📁 Estrutura do repositório

Repare na pasta `EcoFood_Api/EcoFood_Api/`: o submódulo é montado em `EcoFood_Api/` e **dentro dele** existe outra pasta `EcoFood_Api/` com a solution. Quase todo erro de "caminho não existe" vem daí.

```
EcoFood/
├── Documents/                          # Documentação acadêmica e apresentação
├── EcoFood_Api/                        # ← submódulo: EcoFood-Backend
│   ├── Database/
│   │   ├── init.sql                    # Schema + índices + dados de exemplo
│   │   └── upgrade_login.sql           # Migração manual p/ bancos antigos
│   └── EcoFood_Api/
│       ├── EcoFood.slnx                # Solution (rode dotnet test aqui)
│       ├── EcoFood.Api/
│       │   ├── Auth/SessaoUsuario.cs   # Claims e principal do token
│       │   ├── Controllers/            # Auth, Usuarios, Doacoes, Reservas
│       │   ├── Data/AppDbContext.cs    # Mapeamento EF Core
│       │   ├── Dtos/                   # Contratos de entrada e saída
│       │   ├── Models/                 # Entidades e enums
│       │   ├── Migrations/             # Migrations do EF Core
│       │   └── Program.cs              # DI, CORS, auth, rate limit, Swagger
│       └── EcoFood.Api.Tests/          # Testes xUnit
└── EcoFood.Web/                        # ← submódulo: EcoFood-Frontend
    └── src/
        ├── api/                        # client.ts (Axios), auth.ts, recursos.ts
        ├── auth/                       # Rotas protegidas, sessão, validação
        ├── components/                 # StatusChip, DoacaoCard, ConfirmarEnderecoPanel
        ├── context/                    # AuthContext (sessão + perfil ativo)
        ├── pages/                       # Entrar, Cadastro, MinhaConta, Doacoes,
        │                               #   NovaDoacao, MinhasReservas, Pessoas
        └── types/                      # Tipos compartilhados
```

---

## ✅ Pré-requisitos

| Requisito | Versão mínima | Como verificar |
|---|---|---|
| [.NET SDK](https://dotnet.microsoft.com/download) | **10.0** | `dotnet --version` |
| [Node.js](https://nodejs.org/) | **20 LTS** | `node --version` |
| [MySQL Server](https://dev.mysql.com/downloads/mysql/) | **8.0** | `mysql --version` |
| [Git](https://git-scm.com/) | qualquer | `git --version` |

> 💡 **MySQL Workbench** é opcional, mas ajuda a inspecionar o banco durante a apresentação.

---

## 🚀 Instalação

### 1️⃣ Clone o repositório com os submódulos

```bash
git clone --recurse-submodules https://github.com/devCaio00/EcoFood.git
cd EcoFood
```

### 2️⃣ Crie o banco de dados

O script cria o schema completo **e já insere dados de exemplo** (3 doadores, 2 receptores, 3 doações).

```bash
mysql -u root -p < EcoFood_Api/Database/init.sql
```

**Ou pelo MySQL Workbench:** abra `EcoFood_Api/Database/init.sql` e execute (⚡ *Execute Script*).

Confirme que funcionou:

```sql
USE ecofood;
SELECT Nome, TipoUsuario FROM Usuarios;
```

<details>
<summary>🔄 <b>Já tinha o banco criado antes do login existir?</b></summary>

Se o seu banco veio da primeira versão do `init.sql` (sem a coluna `SenhaHash`), rode **uma única vez**:

```bash
mysql -u root -p < EcoFood_Api/Database/upgrade_login.sql
```

Ele adiciona `Usuarios.SenhaHash` e troca as foreign keys de doador e receptor para `ON DELETE RESTRICT`. Em banco novo, criado pelo `init.sql` atual, **não rode** — as alterações já estão lá.

</details>

### 3️⃣ Configure a senha do banco na API

A string de conexão **não deve ser commitada com a sua senha**. Use o *user secrets* do .NET, que guarda o valor fora do repositório:

```bash
cd EcoFood_Api/EcoFood_Api/EcoFood.Api

dotnet user-secrets set "ConnectionStrings:DefaultConnection" \
  "Server=localhost;Port=3306;Database=ecofood;User=root;Password=SUA_SENHA;"
```

<details>
<summary>💻 No PowerShell (Windows)</summary>

```powershell
cd EcoFood_Api\EcoFood_Api\EcoFood.Api

dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Port=3306;Database=ecofood;User=root;Password=SUA_SENHA;"
```

</details>

Verifique o que ficou salvo:

```bash
dotnet user-secrets list
```

> ⚠️ O *user secret* tem **prioridade sobre o `appsettings.json`** em ambiente de desenvolvimento. Se a conexão falhar com uma senha que você jurava estar certa, confira o secret antes do `appsettings.json`.

### 4️⃣ Aponte o frontend para a porta da API

A API sobe em **`http://localhost:5158`** (definido em `Properties/launchsettings.json`), mas o valor embutido no código do frontend é `http://localhost:5050/api`. **Sem o passo abaixo, a tela não fala com a API.**

Crie um `.env` na **raiz de `EcoFood.Web/`** — não dentro de `src/`, porque o Vite só lê variáveis a partir da raiz do projeto:

```ini
# EcoFood.Web/.env
VITE_API_BASE_URL=http://localhost:5158/api
```

> 🔁 O Vite só lê variáveis de ambiente **na inicialização**. Depois de criar ou editar o `.env`, reinicie o `npm run dev`.

### 5️⃣ Instale as dependências do frontend

```bash
cd EcoFood.Web
npm install
```

---

## ▶️ Rodando o sistema

O EcoFood precisa de **dois terminais rodando ao mesmo tempo** — a API e o frontend são processos separados.

### 🖥️ Terminal 1 — API

```bash
cd EcoFood_Api/EcoFood_Api/EcoFood.Api
dotnet run
```

Aguarde a mensagem:

```
Now listening on: http://localhost:5158
```

### 🖥️ Terminal 2 — Frontend

```bash
cd EcoFood.Web
npm run dev
```

Aguarde:

```
➜  Local:   http://localhost:5173/
```

### 🌐 Acessos

| Serviço | URL |
|---|---|
| 🖼️ **Aplicação web** | http://localhost:5173 |
| 📘 **Swagger (API)** | http://localhost:5158/swagger |
| 🔌 **API base** | http://localhost:5158/api |

> 🔑 **Primeiro passo na interface:** clique em **Cadastro** e crie uma conta (Doador ou Receptor, senha de 8+ caracteres). Os usuários do `init.sql` não têm senha e não conseguem entrar. Depois de logado, o menu se ajusta ao seu tipo de perfil.

---

## 🔌 Endpoints da API

### 🔐 Autenticação

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/login` | Autentica e devolve o token Bearer (limite: 10/min por IP) |
| `GET` | `/api/auth/me` | Dados do usuário da sessão atual — **requer token** |

```jsonc
// POST /api/auth/login
{
  "email": "ong@exemplo.com",
  "senha": "senha-de-8-ou-mais"
}
```

### 👤 Usuários

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/usuarios` | Lista usuários. Filtro opcional: `?tipo=Doador\|Receptor\|Admin` |
| `GET` | `/api/usuarios/{id}` | Busca um usuário |
| `POST` | `/api/usuarios` | Cadastra usuário (é o endpoint da tela de Cadastro) |
| `PUT` | `/api/usuarios/{id}` | Atualiza dados e troca senha — **requer token** |
| `DELETE` | `/api/usuarios/{id}` | Remove o usuário — **requer token** |

```jsonc
// POST /api/usuarios
{
  "nome": "ONG Mesa Solidaria",
  "email": "ong@exemplo.com",
  "telefone": "31999990004",
  "tipoUsuario": "Receptor",
  "endereco": "R. da Esperanca, 50 - Contagem/MG",
  "senha": "troque-esta-senha"   // opcional, mas sem ela não há login
}
```

```jsonc
// PUT /api/usuarios/4  — troca de senha exige a senha atual
{
  "nome": "ONG Mesa Solidaria",
  "senhaAtual": "senha-antiga",
  "novaSenha": "senha-nova-8+"
}
```

### 🥗 Doações

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/doacoes` | Lista doações. Filtro opcional: `?status=Disponivel` |
| `GET` | `/api/doacoes/{id}` | Busca uma doação |
| `POST` | `/api/doacoes` | Publica uma doação |
| `PUT` | `/api/doacoes/{id}/cancelar` | Cancela a doação |

### 📦 Reservas

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/reservas` | Lista reservas. Filtro opcional: `?receptorId=4` |
| `POST` | `/api/reservas` | Cria reserva — **exige `enderecoConfirmado: true`** |
| `PUT` | `/api/reservas/{id}/concluir` | Marca retirada concluída (doação → `Retirado`) |
| `PUT` | `/api/reservas/{id}/cancelar` | Cancela (doação volta a `Disponivel`) |

---

## 🛡️ Demonstrando a regra de negócio

A validação **não depende da interface**. Chamando a API diretamente com `enderecoConfirmado: false`:

```bash
curl -i -X POST http://localhost:5158/api/reservas \
  -H "Content-Type: application/json" \
  -d '{"doacaoId":2,"receptorId":4,"enderecoConfirmado":false}'
```

<details>
<summary>💻 No PowerShell (Windows)</summary>

```powershell
try {
  Invoke-WebRequest -Uri "http://localhost:5158/api/reservas" -Method Post `
    -ContentType "application/json" `
    -Body '{"doacaoId":2,"receptorId":4,"enderecoConfirmado":false}'
} catch {
  $_.Exception.Response.StatusCode
  $_.ErrorDetails.Message
}
```

</details>

**Resposta esperada — `400 Bad Request`:**

```json
{ "mensagem": "E necessario confirmar o endereco de retirada antes de reservar." }
```

Isso prova que, mesmo contornando a tela, ninguém reserva sem confirmar o endereço.

---

## 🧪 Testes

### Backend (xUnit)

```bash
cd EcoFood_Api/EcoFood_Api
dotnet test
```

Cobre os quatro controllers (`Auth`, `Usuarios`, `Doacoes`, `Reservas`), usando `EntityFrameworkCore.InMemory` para os testes de unidade e `Mvc.Testing` para os de integração ponta a ponta. Inclui testes do fluxo de login e da migração `LoginUsuarios`.

### Frontend (Vitest)

```bash
cd EcoFood.Web
npm test
```

Cobre `StatusChip`, `ConfirmarEnderecoPanel`, a tela de login e os módulos de sessão e validação.

### Lint do frontend

```bash
cd EcoFood.Web
npm run lint
```

---

## 🗄️ Modelo de dados

```
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│   Usuarios   │          │   Doacoes    │          │   Reservas   │
├──────────────┤          ├──────────────┤          ├──────────────┤
│ Id       PK  │◄────┐    │ Id       PK  │◄───1:N──►│ Id       PK  │
│ Nome         │     └────│ DoadorId FK  │          │ DoacaoId FK  │
│ Email     UQ │          │ Descricao    │     ┌────│ ReceptorId FK│
│ SenhaHash    │          │ Categoria    │     │    │ EnderecoConf.│
│ Telefone     │          │ Quantidade   │     │    │ EnderecoSnap.│
│ TipoUsuario  │          │ UnidadeMedida│     │    │ DataReserva  │
│ Endereco     │          │ ValidadeAlim.│     │    │ DataRetirada │
│ DataCadastro │          │ Status       │     │    │ Status       │
└──────────────┘          │ Observacoes  │     │    └──────────────┘
        ▲                 │ DataCriacao  │     │
        └─────────────────┴──────────────┘     │
                                               │
                        Receptor ──────────────┘
```

**Enums:**

| Campo | Valores |
|---|---|
| `TipoUsuario` | `Doador` · `Receptor` · `Admin` |
| `StatusDoacao` | `Disponivel` · `Reservado` · `Retirado` · `Expirado` · `Cancelado` |
| `StatusReserva` | `Pendente` · `Concluida` · `Cancelada` |

**Integridade referencial:**

| Relação | Regra |
|---|---|
| `Doacoes.DoadorId` → `Usuarios.Id` | `ON DELETE RESTRICT` — não se apaga um doador que tem doações |
| `Reservas.ReceptorId` → `Usuarios.Id` | `ON DELETE RESTRICT` — não se apaga um receptor que tem reservas |
| `Reservas.DoacaoId` → `Doacoes.Id` | `ON DELETE CASCADE` — apagar a doação apaga suas reservas |

---

## 🩺 Solução de problemas

<details>
<summary><b>❌ As pastas EcoFood_Api/ e EcoFood.Web/ estão vazias</b></summary>

Você clonou sem os submódulos. Rode na raiz do repositório:

```bash
git submodule update --init --recursive
```

</details>

<details>
<summary><b>❌ Swagger ou o frontend retorna 500 ao buscar dados</b></summary>

Quase sempre é conexão com o MySQL. Rode a API pelo terminal (`dotnet run`) e leia o erro:

| Mensagem no log | Causa | Solução |
|---|---|---|
| `Access denied ... (using password: YES)` | Senha incorreta | Refaça o `dotnet user-secrets set` |
| `Access denied ... (using password: NO)` | Senha vazia chegando | Existe um *user secret* sem senha sobrescrevendo o `appsettings.json` — rode `dotnet user-secrets list` |
| `Unable to connect` | MySQL parado | Inicie o serviço MySQL |
| `Table 'ecofood.Usuarios' doesn't exist` | Schema não criado | Execute `EcoFood_Api/Database/init.sql` |
| `Unknown column 'SenhaHash'` | Banco da versão antiga | Execute `EcoFood_Api/Database/upgrade_login.sql` |

</details>

<details>
<summary><b>❌ "Nao foi possivel falar com a API"</b></summary>

A API não está rodando, ou está em uma porta diferente da que o frontend procura. A mensagem de erro do frontend cita `localhost:5050`, mas a API sobe em **5158** — esse é o caso mais comum.

1. Confirme que o terminal da API mostra `Now listening on: http://localhost:5158`
2. Crie `EcoFood.Web/.env` com `VITE_API_BASE_URL=http://localhost:5158/api`
3. Reinicie o `npm run dev` após mexer no `.env`

</details>

<details>
<summary><b>❌ "E-mail ou senha invalidos" com um usuário do init.sql</b></summary>

Os usuários de exemplo são inseridos **sem senha** (`SenhaHash NULL`) e por isso nenhum deles consegue logar. Crie sua conta na tela **Cadastro**.

Se precisar de um login específico para a apresentação, cadastre-o pela tela ou pelo `POST /api/usuarios` incluindo o campo `senha` — o hash é gerado pela API, então não dá para inserir senha por SQL direto.

</details>

<details>
<summary><b>❌ 429 "Muitas tentativas seguidas"</b></summary>

O *rate limiter* do login permite 10 tentativas por minuto por IP. Espere um minuto e tente de novo.

</details>

<details>
<summary><b>❌ "Failed to bind to address ... address already in use"</b></summary>

Já existe uma API rodando nessa porta.

```powershell
# Windows — descobre e encerra o processo
Get-NetTCPConnection -LocalPort 5158 | Select-Object -First 1 -ExpandProperty OwningProcess | Stop-Process -Force
```

```bash
# Linux / macOS
lsof -ti:5158 | xargs kill -9
```

</details>

<details>
<summary><b>❌ "Could not find the global property 'UserSecretsId'"</b></summary>

Você rodou o comando na pasta errada. O `dotnet user-secrets` precisa ser executado dentro de `EcoFood_Api/EcoFood_Api/EcoFood.Api`, onde o `.csproj` declara:

```xml
<UserSecretsId>ecofood-api</UserSecretsId>
```

</details>

<details>
<summary><b>❌ "O caminho do arquivo fornecido não existe"</b></summary>

Lembre da pasta dupla: o projeto da API fica em `EcoFood_Api/EcoFood_Api/EcoFood.Api/` e a solution em `EcoFood_Api/EcoFood_Api/`. Caminhos em `--project` são relativos ao diretório atual.

</details>

---

## 🔐 Segurança e configuração local

- Credenciais de banco ficam em **user secrets**, nunca no código versionado.
- Senhas de usuário são guardadas **somente como hash**; a entidade `Usuario` marca `SenhaHash` com `[JsonIgnore]`, então o campo nunca sai nas respostas da API.
- O CORS libera apenas `http://localhost:5173` por padrão, configurável via `Cors:AllowedOrigin`.
- Login tem *rate limiting* por IP e o token expira em 1 hora.
- O `.gitignore` da raiz cobre `appsettings.json`, `.env*`, `bin/`, `obj/` e `node_modules/`. **Atenção:** `.gitignore` de um repositório não vale dentro de um submódulo — cada sub-repo precisa do seu próprio.

---

## 📌 Pendências conhecidas

Levantadas na revisão desta documentação; valem como próximos passos:

| # | Item |
|---|---|
| 1 | **Porta divergente:** a API sobe em `5158`, mas o *fallback* no código do frontend (`client.ts`, `src/.env.example`) é `5050`. Unificar em um dos dois evita o `.env` obrigatório. |
| 2 | **`.env.example` no lugar errado:** está em `EcoFood.Web/src/`, mas o Vite só lê a partir da raiz do projeto. Deveria ser `EcoFood.Web/.env.example`. |
| 3 | **Submódulo backend sem `.gitignore`:** `appsettings.json` está versionado lá; `bin/` e `obj/` não estão protegidos. |
| 4 | **`.env` não ignorado no frontend:** o `.gitignore` do `EcoFood-Frontend` não lista `.env`. |
| 5 | **Autorização parcial:** só `/api/auth/me`, `PUT`/`DELETE` de usuários exigem token. `POST /api/doacoes` e `POST /api/reservas` aceitam chamada anônima — a proteção hoje é só de tela. |
| 6 | **Dados de exemplo sem senha:** nenhum usuário do `init.sql` consegue logar. Um seed com hashes facilitaria a apresentação. |
| 7 | **README do frontend** ainda é o template padrão do Vite. |
| 8 | **Ponteiros dos submódulos** deste repositório ficam desatualizados com facilidade; vale um passo no fluxo de trabalho para atualizá-los junto com cada entrega. |

---

<div align="center">

**Projeto acadêmico A3** · Desenvolvido com foco nos Objetivos de Desenvolvimento Sustentável da ONU

🌱 *Menos desperdício. Mais pratos cheios.*

</div>
