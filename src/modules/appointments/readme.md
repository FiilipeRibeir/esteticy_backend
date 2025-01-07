# API de Agendamento de Compromissos

Esta API permite o gerenciamento de compromissos, permitindo a criação, exclusão, atualização e listagem de compromissos agendados. É possível também filtrar os compromissos por usuário, data e status.

## Endpoints

### 1. **Criar Compromisso**
   - **Método**: `POST /appointment`
   - **Descrição**: Cria um novo compromisso com título, usuário, data e status.
   - **Corpo da Requisição**:
     ```json
     {
       "title": "Título do Compromisso",
       "userId": "ID do Usuário",
       "date": "Data do Compromisso",
       "status": "PENDENTE" // Status inicial
     }
     ```
   - **Resposta de Sucesso**:
     ```json
     {
       "id": "ID do Compromisso",
       "title": "Título do Compromisso",
       "userId": "ID do Usuário",
       "date": "Data do Compromisso",
       "status": "PENDENTE"
     }
     ```
   - **Resposta de Erro**:
     - `400 Bad Request`: Se a data não for informada ou já houver um compromisso na mesma data e hora.

---

### 2. **Listar Compromissos**
   - **Método**: `GET /appointment`
   - **Descrição**: Retorna todos os compromissos ou filtra por usuário, data e status.
   - **Parâmetros de Query** (opcionais):
     - `userId`: ID do usuário para filtrar.
     - `date`: Data para filtrar compromissos no mesmo dia.
     - `status`: Status do compromisso para filtrar (`PENDENTE`, `CANCELADO`, `CONCLUÍDO`).
   - **Resposta de Sucesso**:
     ```json
     [
       {
         "id": "ID do Compromisso",
         "title": "Título do Compromisso",
         "userId": "ID do Usuário",
         "date": "Data do Compromisso",
         "status": "PENDENTE"
       }
     ]
     ```
   - **Resposta Caso não tenha lista**:
     - `200 OK`: Nenhum agendamento encontrado para os critérios informados.

---

### 3. **Excluir Compromisso**
   - **Método**: `DELETE /appointment`
   - **Descrição**: Exclui um compromisso existente com base no ID.
   - **Parâmetros de Query**:
     - `id`: ID do compromisso a ser excluído.
   - **Resposta de Sucesso**:
     ```json
     {
       "message": "appointment deletado com sucesso",
       "id": "ID do Compromisso"
     }
     ```
   - **Resposta de Erro**:
     - `400 Bad Request`: Se o ID não for informado.
     - `404 Not Found`: Se o compromisso não for encontrado.

---

### 4. **Reagendar Compromisso**
   - **Método**: `PUT /appointment`
   - **Descrição**: Atualiza a data de um compromisso e reinicia o status para `PENDENTE`.
   - **Corpo da Requisição**:
     ```json
     {
       "id": "ID do Compromisso",
       "date": "Nova Data"
     }
     ```
   - **Resposta de Sucesso**:
     ```json
     {
       "id": "ID do Compromisso",
       "title": "Título do Compromisso",
       "userId": "ID do Usuário",
       "date": "Nova Data",
       "status": "PENDENTE"
     }
     ```
   - **Resposta de Erro**:
     - `400 Bad Request`: Se o ID ou a nova data não forem informados.
     - `404 Not Found`: Se o compromisso não for encontrado.

---

### 5. **Atualizar Status do Compromisso**
   - **Método**: `PATCH /appointment/status`
   - **Descrição**: Atualiza o status de um compromisso para `CANCELADO` ou `CONCLUÍDO`.
   - **Corpo da Requisição**:
     ```json
     {
       "id": "ID do Compromisso",
       "status": "CANCELADO" // ou "CONCLUÍDO"
     }
     ```
   - **Resposta de Sucesso**:
     ```json
     {
       "id": "ID do Compromisso",
       "title": "Título do Compromisso",
       "userId": "ID do Usuário",
       "date": "Data do Compromisso",
       "status": "CANCELADO" // ou "CONCLUÍDO"
     }
     ```
   - **Resposta de Erro**:
     - `400 Bad Request`: Se o ID ou o status não forem informados.
     - `404 Not Found`: Se o compromisso não for encontrado.

---

## Mensagens de Erro

As respostas de erro seguem o padrão:

- **400 Bad Request**: Quando os parâmetros obrigatórios não são fornecidos ou inválidos.
- **404 Not Found**: Quando o compromisso não é encontrado.
- **500 Internal Server Error**: Quando ocorre um erro inesperado no servidor.

---