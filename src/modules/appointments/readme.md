# API de Agendamento de Compromissos

Esta API permite o gerenciamento de compromissos, incluindo criação, exclusão, atualização e listagem de compromissos agendados. Também é possível filtrar compromissos por usuário, data e status.

## Endpoints

### 1. **Criar Compromisso**
   - **Método**: `POST /appointment`
   - **Descrição**: Cria um novo compromisso com os detalhes fornecidos.
   - **Corpo da Requisição**:
     ```json
     {
       "title": "Título do Compromisso",
       "userId": "ID do Usuário",
       "date": "Data do Compromisso (YYYY-MM-DDTHH:mm:ss.sssZ)",
       "workId": "ID do Trabalho",
       "paymentStatus": "PENDENTE", // ou PARCIAL, PAGO
       "paidAmount": 50.00 // Valor já pago
     }
     ```
   - **Resposta de Sucesso**:
     ```json
     {
       "id": "ID do Compromisso",
       "title": "Título do Compromisso",
       "userId": "ID do Usuário",
       "date": "Data do Compromisso",
       "workId": "ID do Trabalho",
       "paymentStatus": "PENDENTE",
       "paidAmount": 50.00
     }
     ```
   - **Resposta de Erro**:
     - `400 Bad Request`: Se campos obrigatórios não forem informados.
     - `409 Conflict`: Se já houver um compromisso na mesma data e hora.

---

### 2. **Listar Compromissos**
   - **Método**: `GET /appointment`
   - **Descrição**: Retorna todos os compromissos ou filtra com base nos parâmetros fornecidos.
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
         "workId": "ID do Trabalho",
         "paymentStatus": "PENDENTE",
         "paidAmount": 50.00
       }
     ]
     ```
   - **Resposta Caso não haja compromissos**:
     - `200 OK`: Lista vazia.

---

### 3. **Excluir Compromisso**
   - **Método**: `DELETE /appointment`
   - **Descrição**: Exclui um compromisso existente com base no ID.
   - **Parâmetros de Query**:
     - `id`: ID do compromisso a ser excluído.
   - **Resposta de Sucesso**:
     ```json
     {
       "message": "Compromisso deletado com sucesso",
       "id": "ID do Compromisso"
     }
     ```
   - **Resposta de Erro**:
     - `400 Bad Request`: Se o ID não for informado.
     - `404 Not Found`: Se o compromisso não for encontrado.

---

### 4. **Atualizar Data do Compromisso**
   - **Método**: `PUT /appointment`
   - **Descrição**: Atualiza a data de um compromisso existente.
   - **Corpo da Requisição**:
     ```json
     {
       "id": "ID do Compromisso",
       "date": "Nova Data do Compromisso (YYYY-MM-DDTHH:mm:ss.sssZ)"
     }
     ```
   - **Resposta de Sucesso**:
     ```json
     {
       "id": "ID do Compromisso",
       "title": "Título do Compromisso",
       "userId": "ID do Usuário",
       "date": "Nova Data",
       "workId": "ID do Trabalho",
       "paymentStatus": "PENDENTE",
       "paidAmount": 50.00
     }
     ```
   - **Resposta de Erro**:
     - `400 Bad Request`: Se o ID ou a nova data não forem fornecidos.
     - `404 Not Found`: Se o compromisso não for encontrado.

---

### 5. **Atualizar Status do Compromisso**
   - **Método**: `PATCH /appointment/status`
   - **Descrição**: Atualiza o status de um compromisso.
   - **Corpo da Requisição**:
     ```json
     {
       "id": "ID do Compromisso",
       "status": "CANCELADO" // ou CONCLUÍDO
     }
     ```
   - **Resposta de Sucesso**:
     ```json
     {
       "id": "ID do Compromisso",
       "title": "Título do Compromisso",
       "userId": "ID do Usuário",
       "date": "Data do Compromisso",
       "workId": "ID do Trabalho",
       "paymentStatus": "CANCELADO",
       "paidAmount": 50.00
     }
     ```
   - **Resposta de Erro**:
     - `400 Bad Request`: Se o ID ou o status não forem fornecidos.
     - `404 Not Found`: Se o compromisso não for encontrado.

---

## Mensagens de Erro

As respostas de erro seguem o padrão:

- **400 Bad Request**: Quando parâmetros obrigatórios não são fornecidos ou inválidos.
- **404 Not Found**: Quando o compromisso não é encontrado.
- **409 Conflict**: Quando já existe um compromisso na mesma data e hora.
- **500 Internal Server Error**: Quando ocorre um erro inesperado no servidor.

---