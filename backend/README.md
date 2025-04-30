# CRUD de Produtos

Projeto simples para gerenciar produtos com operações básicas (criar, ler, atualizar e deletar).

## Visão Geral

Neste projeto teremos um backend em Java com Spring Boot e um frontend em React, permitindo a criação, leitura, atualização e exclusão de produtos.

### Funcionalidades

*   **Criação de Produtos:** Adicione novos produtos ao sistema com nome, descrição e preço.
*   **Listagem de Produtos:** Visualize todos os produtos cadastrados em uma tabela.
*   **Edição de Produtos:** Modifique os detalhes de um produto existente.
*   **Exclusão de Produtos:** Remova produtos do sistema.

## Tecnologias

*   **Backend:**
    *   Java
    *   Spring Boot
    *   Maven
*   **Frontend:**
    *   React
    *   JavaScript
    *   Vite

## Configuração do `application.properties`

O arquivo `application.properties` é responsável pelas configurações do backend Spring Boot.

Abaixo está um exemplo básico para rodar o projeto localmente com banco de dados H2 em memória:

```properties
# Porta do servidor
server.port=8080

# Configuração do banco de dados H2 (em memória)
spring.datasource.url=jdbc:h2:mem:produtosdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# Configurações do JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

# Habilita o console web do H2
spring.h2.console.enabled=true

## Licença

Código livre pra usar, modificar e compartilhar.