# **Documentação da API - Módulo Work**

## **Base URL:**  
`http://seuservidor.com/work`

---

## **Endpoints**

### **1. Criar Trabalho**
   - **Método:** `POST /create`
   - **Descrição:** Cria um novo trabalho associado a um usuário.
   - **Corpo da Requisição:**
     ```json
     {
       "userId": "ID do Usuário",
       "name": "Nome do Trabalho",
       "description": "Descrição do Trabalho (opcional)",
       "price": 123.45
     }
     ```
   - **Respostas de Sucesso:**
     ```json
     {
       "id": "ID do Trabalho",
       "userId": "ID do Usuário",
       "name": "Nome do Trabalho",
       "description": "Descrição do Trabalho",
       "price": 123.45,
       "createdAt": "2023-01-01T00:00:00.000Z"
     }
     ```
   - **Erros Possíveis:**
     - `400 Bad Request`: Campos obrigatórios ausentes.
     - `404 Not Found`: Usuário não encontrado.

---

### **2. Listar Todos os Trabalhos**
   - **Método:** `GET /get`
   - **Descrição:** Retorna todos os trabalhos cadastrados.
   - **Respostas de Sucesso:**
     ```json
     [
       {
         "id": "ID do Trabalho",
         "userId": "ID do Usuário",
         "name": "Nome do Trabalho",
         "description": "Descrição do Trabalho",
         "price": 123.45,
         "createdAt": "2023-01-01T00:00:00.000Z"
       }
     ]
     ```
   - **Erros Possíveis:**
     - `500 Internal Server Error`: Erro ao buscar os trabalhos.

---

### **3. Listar Trabalhos com Filtros**
   - **Método:** `GET /filter`
   - **Descrição:** Retorna trabalhos filtrados por usuário, nome, descrição ou preço.
   - **Parâmetros de Query (opcionais):**
     - `userId`: Filtrar por ID do usuário.
     - `name`: Filtrar por nome (busca parcial, case insensitive).
     - `description`: Filtrar por descrição (busca parcial, case insensitive).
     - `price`: Filtrar por preço exato.
   - **Exemplo de Requisição:**
     `GET /filter?name=exemplo&price=100`
   - **Respostas de Sucesso:**
     ```json
     [
       {
         "id": "ID do Trabalho",
         "userId": "ID do Usuário",
         "name": "Nome do Trabalho",
         "description": "Descrição do Trabalho",
         "price": 123.45,
         "createdAt": "2023-01-01T00:00:00.000Z"
       }
     ]
     ```
   - **Erros Possíveis:**
     - `400 Bad Request`: Filtro inválido (ex.: preço não numérico).
     - `500 Internal Server Error`: Erro ao buscar os trabalhos.

---

### **4. Atualizar Trabalho**
   - **Método:** `PUT /update`
   - **Descrição:** Atualiza as informações de um trabalho existente.
   - **Corpo da Requisição:**
     ```json
     {
       "id": "ID do Trabalho",
       "name": "Novo Nome (opcional)",
       "description": "Nova Descrição (opcional)",
       "price": 150.00 // Novo preço (opcional)
     }
     ```
   - **Respostas de Sucesso:**
     ```json
     {
       "id": "ID do Trabalho",
       "userId": "ID do Usuário",
       "name": "Novo Nome",
       "description": "Nova Descrição",
       "price": 150.00,
       "updatedAt": "2023-01-01T00:00:00.000Z"
     }
     ```
   - **Erros Possíveis:**
     - `400 Bad Request`: ID não informado.
     - `404 Not Found`: Trabalho não encontrado.

---

### **5. Deletar Trabalho**
   - **Método:** `DELETE /delete`
   - **Descrição:** Exclui um trabalho existente.
   - **Corpo da Requisição:**
     ```json
     {
       "id": "ID do Trabalho"
     }
     ```
   - **Respostas de Sucesso:**
     ```json
     {
       "message": "Trabalho deletado com sucesso",
       "id": "ID do Trabalho"
     }
     ```
   - **Erros Possíveis:**
     - `400 Bad Request`: ID não informado.
     - `404 Not Found`: Trabalho não encontrado.

---

## **Mensagens de Erro**
- **400 Bad Request:** Parâmetros obrigatórios ausentes ou inválidos.
- **404 Not Found:** Recurso não encontrado.
- **500 Internal Server Error:** Erro inesperado no servidor.

---
