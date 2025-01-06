# Documentação da API - Usuários

## Rota: Criar Usuário

### Método:
POST

### Endpoint:
`/user`

### Descrição:
Cria um novo usuário no sistema.

### Corpo da Requisição:
```json
{
  "name": "string",
  "nickname": "string",
  "email": "string",
  "password": "string"
}
```

-------------------------------------------------------------

## Rota: Deletar Usuário

### Método:
DELETE

### Endpoint:
`/user`

### Descrição:
Remove um usuário do sistema.

### Parâmetros de Query:
- **id**: `string` (ID do usuário a ser deletado)

### Exemplo de URL:
`/user?id={id}`

-------------------------------------------------------------

## Rota: Listar Usuários

### Método:
`GET`

### Endpoint:
`/user`

### Descrição:
Retorna a lista de usuários cadastrados no sistema. Se o parâmetro de query `email` for fornecido, retorna os dados de um único usuário correspondente ao e-mail.

### Parâmetros de Query:
- **email** (opcional): `string` - E-mail do usuário a ser buscado. Se fornecido, a resposta será os dados do usuário correspondente ao e-mail. Caso contrário, a resposta será a lista completa de usuários cadastrados.

### Exemplo de URL:
- `/user?email={email}`

### Respostas:

- **200 OK**: Lista de usuários retornada com sucesso ou um único usuário encontrado.

Caso o parâmetro `email` não seja fornecido, todos os usuários serão retornados.

Exemplo de resposta ao buscar todos os usuários:
```json
[
  {
    "id": "string",
    "name": "string",
    "nickname": "string",
    "email": "string",
    "status": "boolean"
  }
]
```

-------------------------------------------------------------

## Rota: Atualizar Usuário

### Método:
`PUT`

### Endpoint:
`/user`

### Descrição:
Atualiza as informações de um usuário existente.

### Parâmetros de Query:
- **id**: `string` (ID do usuário a ser atualizado)

### Exemplo de URL:
`/user?id={id}`

### Corpo da Requisição:
```json
{
  "name": "string",
  "nickname": "string",
  "email": "string",
  "password": "string"
}
```