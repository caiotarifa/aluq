# TODO — Estrutura Fundacional do Aluq

Checklist estrutural para solidificar a base antes de escalar entidades.

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| 🟢 | Esforço baixo — até ~2h |
| 🟡 | Esforço médio — ~2h a ~6h |
| 🔴 | Esforço alto — ~6h+ |
| ⭐ | Bloqueia ou impacta diretamente a criação de novas entidades |
| ✅ | Concluído |

---

## 1. Correções e Bugs (List + Form)

> Itens que impedem o uso correto do que já existe. Resolver antes de tudo.

### 1.1 ✅ Redesenhar sistema de filtros na URL (legibilidade)

**Arquivos principais:** `app/composables/useRouteQuery.js`, `app/composables/useEntityList.js`, `app/components/list/ListFilter.vue`

O problema dos filtros não é um bug, mas sim um **erro de design**. Atualmente os filtros são serializados como `?filter=[...]` usando JSON, o que não tem legibilidade e dificulta compartilhamento de URLs.

**O que precisa ser feito:**
- Redesenhar a serialização de filtros para usar um padrão legível na URL, como `?filter[name$equals]=Acme&filter[taxId$contains]=123`.
- Definir convenções de nomenclatura:
  - `?filter[{property}${operator}]={value}` para valores únicos
  - Para operadores de array (`in`, `notIn`): `?filter[id$in]=1&filter[id$in]=2` ou usar vírgulas `?filter[id$in]=1,2`
  - Para operadores de range (`between`): `?filter[price$between]=100,500` ou `?filter[price$between][min]=100&filter[price$between][max]=500`
  - Para operadores vazios (`isEmpty`, `isNotEmpty`): apenas a presença da chave já indica o filtro, como `?filter[email$isEmpty]`
- Atualizar o `parse` e `serialize` em `useRouteQuery.js` para suportar esse novo formato.
- Garantir retrocompatibilidade ou migração suave se houver URLs antigas salvas em bookmarks.
- Testar com filtros compostos (múltiplos filtros simultâneos) e com troca de views (abas).

---

### 1.2 ✅ Forçar validação Zod ao submeter Form

**Arquivos principais:** `app/components/form/Form.vue`, `app/entities/businessUnit.js`

O Nuxt UI v4 aceita schemas Zod diretamente via prop `:schema`, porém **a validação não está sendo forçada** no submit. Atualmente é possível salvar um formulário completamente vazio, mesmo com campos obrigatórios.

**O que precisa ser feito:**
- Investigar por que o `UForm` não está validando antes do submit. Verificar se:
  - A prop `@submit` está configurada corretamente (atualmente o `Form.vue` usa `@submit="onSubmit"`, linha 5).
  - O `UForm` do Nuxt UI v4 valida automaticamente ou precisa de uma chamada explícita de `validate()` antes de emitir o evento `submit`.
- Verificar a documentação do Nuxt UI v4 sobre validação de formulários: https://ui.nuxt.com/docs/components/form
- Se necessário, adicionar uma chamada explícita a `form.validate()` antes de emitir o evento de submit no `Form.vue`.
- Garantir que, ao tentar submeter com erros de validação, os erros apareçam nos campos e o submit seja bloqueado.

---

### 1.3 ⭐🟡 Parsear e exibir erros de servidor no Form

**Arquivos principais:** `app/composables/useServerErrors.js` (novo), `app/composables/useEntityForm.js`, `app/components/form/Form.vue`

Atualmente quando o `save()` falha, apenas um toast genérico é exibido. Erros de validação do ZenStack (unique constraint, foreign key, etc.) não são parseados nem vinculados aos campos.

**O que precisa ser feito:**
- Estudar o formato de erro retornado pelo ZenStack: https://zenstack.dev/docs/orm/errors
- Criar composable `useServerErrors()` que parseia erros do ZenStack e retorna o objeto no formato:
  ```js
  {
    generalErrors: null,
    propertyErrors: {
      taxId: ['Já existe um registro com este valor']
    }
  }
  ```
- O composable precisa ter acesso à função `t()` do i18n para traduzir as mensagens de erro.
- No `catch` do `onSubmit` (linha 169–174 de `useEntityForm.js`), usar o `useServerErrors` para capturar e parsear o erro:
  - Erros de validação de negócio (ex.: unique constraint) → parsear e mapear para campos
  - Erros de rede, 500, timeout → manter toast genérico
- Propagar os `propertyErrors` para o `UForm` usando o método de `setErrors` do Nuxt UI v4 (consultar docs).
- **Importante:** a tradução dos erros para português deve ser feita no front-end. O servidor retorna códigos ou mensagens em inglês (ex.: `unique_constraint_violation`), e o front deve mapear para chaves do i18n (ex.: `errors.uniqueConstraint`).
- Criar estrutura no i18n para essas mensagens de erro (ver item 1.4).

---

### 1.4 ⭐🟡 Traduzir erros do Zod automaticamente

**Arquivos principais:** `app/plugins/zod.js` (novo plugin), `i18n/locales/pt-BR.yml`, `app/entities/`

Atualmente não existe estrutura para traduzir erros de validação do Zod. Precisamos usar a função `t()` do i18n dentro do schema Zod, sem dependências externas.

**O que precisa ser feito:**
- Usar a funcionalidade nativa de customização de erros do Zod: https://zod.dev/error-customization
- Configurar o Zod globalmente usando `setErrorMap` para traduzir os erros baseados na configuração do locale do usuário.
- Criar um plugin Nuxt (`app/plugins/zod.js`) que:
  - Acessa o composable `useI18n()` para obter a função `t()`
  - Define um `errorMap` customizado usando `z.setErrorMap()` 
  - Mapeia todos os tipos de issue do Zod para as chaves de tradução correspondentes
- Consultar a lista completa de issue types: https://zod.dev/packages/core#issue-types
- Definir a estrutura de mensagens no `i18n/locales/pt-BR.yml`:
  ```yaml
  zod:
    errors:
      required: "Este campo é obrigatório"
      invalid_type: "Tipo de valor inválido"
      too_small: "Valor muito pequeno"
      too_big: "Valor muito grande"
      invalid_string: "Formato inválido"
      # ... etc
  ```
- Garantir que mensagens customizadas definidas nos schemas das entidades (ex.: `.min(3, 'Nome deve ter ao menos 3 caracteres')`) continuem funcionando se usarem chaves de i18n.

---

### 1.5 🟢 Tratamento de erros de fetch no List

**Arquivos principais:** `app/composables/useEntityList.js`, `app/composables/useRemoteList.js`, `app/components/list/List.vue`

Quando a requisição de listagem falha (erro de rede, 500), nenhum feedback é dado ao usuário.

**O que precisa ser feito:**
- Extrair `error` e `isError` do retorno de `useRemoteList` (atualmente só retorna `{ list, count }`).
- No `useEntityList`, propagar esses valores.
- No `List.vue`, exibir um estado de erro com possibilidade de retry usando o `refetch` já disponível.
- Seguir o mesmo padrão de `notifyError` usado no `useEntityForm.js` (linhas 86–95) para consistência.

---

## 2. ✅ Experiência de Carregamento (Skeleton / Loading States)

Garantir que todas as telas genéricas tenham feedback visual de loading.

### 2.1 ✅ Implementar skeleton loading no List

**Arquivos principais:** `app/components/list/List.vue`, `app/components/list/ListTableView.vue`

O `ListTableView` já recebe a prop `loading`, mas não renderiza skeletons na tabela. Atualmente existe um skeleton no campo de busca, mas isso não faz sentido, pois o campo de busca, filtros e ordenação devem estar sempre disponíveis mesmo durante o carregamento.

**O que precisa ser feito:**
- **Remover** o skeleton do campo de busca no `List.vue` (linha 6–9). O campo de busca deve sempre estar ativo.
- No `ListTableView.vue`, quando `loading` for `true`, renderizar linhas de skeleton com o mesmo número de colunas das `properties` visíveis.
- Usar o componente `USkeleton` do Nuxt UI para cada célula.
- Definir o número de linhas skeleton igual ao valor de `query.size` (se disponível como prop).
- Garantir que os skeletons respeitem as colunas fixadas (`pinned`).

---

### 2.2 ✅ Implementar skeleton loading no Form

**Arquivos principais:** `app/components/form/Form.vue`, `app/components/form/FormField.vue`, `app/components/input/`

O `Form.vue` recebe a prop `fetching`, mas não exibe skeletons. O formulário aparece com valores vazios até o fetch completar.

**O que precisa ser feito:**
- **Avaliar arquitetura:** considerar que cada componente de input tenha seu próprio skeleton interno, em vez de centralizar a lógica no `Form.vue`.
  - Exemplo: `InputText.vue` renderiza `<USkeleton />` quando recebe prop `loading`.
  - `FormField.vue` repassa a prop `loading={fetching}` para o input.
- Se essa abordagem for adotada:
  - Adicionar prop `loading` em cada componente de input (`InputBoolean`, `InputDate`, etc.).
  - No `FormField.vue`, quando `fetching` for `true`, passar `loading={true}` para o input.
- Garantir que o layout (fieldsets, grid) permaneça intacto, apenas os inputs são substituídos por skeletons.

---

## 3. ✅ Sistema de Tipos de Campo e Inputs

Consolidar o registro de tipos para que novas entidades possam usar qualquer campo sem friction.

### 3.1 ✅ Auditoria e padronização dos property types e inputs

**Arquivos principais:** `app/registry/propertyTypes.js`, `app/components/form/FormField.vue`, `app/components/input/`

Existem inconsistências no registro de tipos de campo que precisam ser corrigidas antes de escalar entidades.

**O que precisa ser feito:**
- Padronizar para usar sempre `component` (não `componentName`) em todos os `resolveInput`.
- Remover o `componentMap` do `FormField.vue` (linhas 45–54) e usar `resolveComponent()` do Vue ou mover o mapa para o registry.
- Garantir que cada property type tenha: `icon`, `operators`, `defaultOperator`, `defaultValue`, `resolveInput`, `resolveFilterInput`.
- **Criar property types faltantes:** `date`, `datetime`, `time`, `phone`, `textarea`, `currency`, `email`, `url`.
- Documentar o contrato de um property type (interface esperada) em comentário JSDoc ou arquivo markdown separado.
- Revisar se os filtros de cada tipo estão funcionais (especialmente `relation` e `code`).
- **Para o tipo `relation`:**
  - O que será mostrado no select é a propriedade definida em `display.property` da entidade relacionada (normalmente `name`).
  - Documentar essa convenção claramente.

---

### 3.2 ✅ Suporte a máscara em property types existentes

**Arquivos principais:** `app/registry/propertyTypes.js`, `app/components/input/`

Permitir que qualquer property type de texto (text, code, etc.) possa receber um atributo `mask` para formatação.

**O que precisa ser feito:**
- Integrar a lib **maska** ao projeto: https://beholdr.github.io/maska/v3/
- Documentação do Nuxt UI sobre uso de máscara: https://ui.nuxt.com/docs/components/input#with-mask
- No `resolveInput` de cada property type, verificar se a propriedade tem um atributo `mask`:
  ```js
  resolveInput: (property) => ({
    component: 'UInput',
    props: {
      mask: property.mask || undefined
    }
  })
  ```
- O `UInput` do Nuxt UI já suporta a diretiva `v-maska` nativamente, então basta passar a prop `mask`.
- Garantir que o `v-model` retorne o valor limpo (sem formatação).

---

### 3.3 ✅ Sistema de máscaras dinâmicas contextuais

**Arquivos principais:** `app/registry/propertyTypes.js`, `app/components/form/FormField.vue`, documentação Maska sobre máscaras dinâmicas

A máscara deve ser adaptada dinamicamente pelo **contexto do formulário**. Por exemplo: no cadastro de uma empresa, ao selecionar o campo `country` como "Brazil", o campo `document` deve automaticamente usar a máscara de CNPJ (`##.###.###/####-##`), mas se selecionar "USA", deve usar a máscara de EIN (`##-#######`).

**O que precisa ser feito:**
- Implementar suporte para que a prop `mask` na definição de propriedades possa ser uma **função** que recebe o estado do formulário e retorna a máscara apropriada:
  ```js
  // app/entities/businessUnit.js
  document: {
    type: 'text',
    mask: (input, state) => {
      if (state.country === 'br') {
        return '##.###.###/####-##'
      }
      return '##-#######'
    }
  }
  ```
- No `FormField.vue` ou no `resolveInput`, avaliar se a `mask` é uma função:
  - Se for função, chamar `mask(input, formState)` para obter a máscara dinâmica
  - Se for string, usar diretamente
- Para o caso de `InputPhone`, a lógica de máscara dinâmica seria **interna ao componente** (baseada no seletor de DDI), não no formulário.
- Garantir que a máscara seja reativa: quando o contexto mudar (ex.: usuário alterar o país), a máscara deve se atualizar automaticamente.

---

### 3.4 ✅ Campo do tipo telefone (InputPhone)

**Arquivos principais:** `app/components/input/InputPhone.vue` (novo), `app/registry/propertyTypes.js`

**O que precisa ser feito:**
- Criar `InputPhone.vue` com máscara dinâmica baseada no código do país.
- Usar a lib **libphonenumber-js** para validação e formatação internacional: https://www.npmjs.com/package/libphonenumber-js
- Registrar o tipo `phone` em `propertyTypes.js`.
- Incluir um seletor de código de país (com bandeira) como parte do componente.
  - Tentar reutilizar componentes do Nuxt UI, como `USelectMenu` com ícones de bandeira – ver como o `ULocaleSelect` faz isso.
- A máscara deve se ajustar automaticamente com base no DDI selecionado (ex.: Brasil alterna entre fixo e celular automaticamente).
- O `v-model` deve retornar o número completo com DDI no formato internacional (ex.: `+5511987654321`).

---

### 3.5 ✅ Campo do tipo endereço (InputAddress)

**Arquivos principais:** `app/components/input/InputAddress.vue` (novo), `app/registry/propertyTypes.js`, `server/api/geocoding/search.js` (novo)

Campo composto para endereços internacionais com busca automática usando OpenStreetMap Nominatim.

**O que precisa ser feito:**
- Criar `InputAddress.vue` como um componente composto com campos na ordem:
  - **País** (seletor com bandeira) – Criar InputCountry.vue usando Intl
  - **CEP/Código Postal**
  - **Endereço 1** (linha principal: rua, número)
  - **Endereço 2** (complemento: apartamento, bloco)
  - **Endereço 3** (bairro ou distrito)
  - **Cidade** (seletor, buscar fonte ou lib global)
  - **Estado/Província** (seletor, buscar fonte ou lib global)
- Implementar campo de **busca** que use API de geocoding para autocompletar endereços:
  - Usar **OpenStreetMap Nominatim**: https://nominatim.org
  - Criar endpoint no servidor (`server/api/geocoding/search.js`) que faz proxy das requisições à API Nominatim
- **Usar NuxtHub para cache e rate-limit:**
  - **Cache** (https://hub.nuxt.com/docs/cache): implementar cache temporário das respostas de geocoding para reduzir requisições à API externa
  - **KV** (https://hub.nuxt.com/docs/kv): usar para implementar rate-limit por usuário, evitando abuso da API
- O `v-model` retorna um objeto com todos os campos de endereço.
- Registrar o tipo `address` em `propertyTypes.js`.
- Definir no schema do ZenStack o padrão de armazenamento (JSON field é mais prático).

---

### 3.6 ✅ Campo de upload com NuxtHub Blob (InputFile)

**Arquivos principais:** `app/components/input/InputFile.vue` (novo), `server/api/upload/` (novo), configuração NuxtHub Blob

Criar um campo de upload seguro usando o **NuxtHub Blob** para armazenamento.

**O que precisa ser feito:**
- Usar **NuxtHub Blob** para armazenamento de arquivos: https://hub.nuxt.com/docs/blob
- Criar `InputFile.vue` baseado nos componentes de upload do Nuxt UI (https://ui.nuxt.com/docs/components/file-input), mas customizado.
- **Fluxo de upload com NuxtHub Blob:**
  1. Front-end prepara o arquivo e envia para endpoint do servidor (`POST /api/upload/request`)
  2. Servidor valida (tipo de arquivo, tamanho máximo, escopo por usuário/organização)
  3. Servidor faz upload direto para o Blob usando `hubBlob().put()`
  4. Servidor retorna a URL do arquivo e metadados
  5. Front-end registra o arquivo no banco de dados
- **Fluxo de download/acesso:**
  - Arquivos privados: gerar URL temporária com tempo de expiração usando `hubBlob().serve()`
  - Arquivos públicos: retornar URL pública se aplicável
- **Segurança:**
  - Validar tipo de arquivo (MIME type) tanto no front quanto no back
  - Validar tamanho máximo no front e no servidor
  - Organizar arquivos por `organizationId/userId/` na estrutura do Blob
  - Implementar varredura de vírus (opcional, mas recomendado para produção) usando serviços como ClamAV ou VirusTotal API
- **Proteções adicionais usando NuxtHub:**
  - Rate-limit de uploads por usuário (usar NuxtHub KV)
  - Quotas de armazenamento por organização (sincronizar com planos do Stripe)
- Registrar o tipo `file` em `propertyTypes.js`.

---

## 4. ✅ Novos Modos de Visualização

### 4.1 ✅ Criar visualização em Cards no List

**Arquivos principais:** `app/components/list/ListCardView.vue` (novo), `app/components/list/List.vue`, `app/composables/useEntityList.js`

Atualmente o List só suporta o tipo `table`. A entidade pode definir `type: 'cards'` na view, mas não existe componente para renderizá-lo.

**O que precisa ser feito:**
- Criar `ListCardView.vue` que renderize os items em um grid responsivo de cards.
- Cada card deve exibir as `properties` da view ativa, respeitando o `display.property` da entidade como título do card.
- O card deve ter:
  - **Título** (valor da property de display)
  - **Propriedades listadas** (as demais properties da view)
  - **Botões de ação** baseados nas `actions` mapeadas na entidade (ex.: editar, deletar, compartilhar, etc.)
- No `List.vue`, alternar entre `ListTableView` e `ListCardView` baseado no `queryModel.type`.
- O tipo de visualização deve ser selecionável pelo usuário (botão toggle no header do List ou no menu de ajustes).

---

### 4.2 ✅ Criar componentes Display (readonly)

**Arquivos principais:** `app/components/display/` (nova pasta), `app/registry/propertyTypes.js`, `app/components/form/Form.vue`

Para cenários onde o usuário não tem permissão de edição ou para telas de visualização/detalhe.

**O que precisa ser feito:**
- Criar uma pasta `app/components/display/` e componentes Display por tipo:
  - `DisplayText.vue` — exibe texto simples
  - `DisplayBoolean.vue` — exibe ícone ✓/✗ ou badge Sim/Não
  - `DisplayDate.vue` — formata data localizada (ex.: "10 de fev. de 2026")
  - `DisplayNumber.vue` — formata número com separadores e casas decimais
  - `DisplaySelect.vue` — exibe a label da opção selecionada (não o valor)
  - `DisplayRelation.vue` — exibe o `display.property` da entidade relacionada
  - etc.
- Em `propertyTypes.js`, adicionar `resolveDisplay` para cada tipo:
  ```js
  text: {
    // ...
    resolveDisplay: () => ({ component: 'DisplayText' })
  }
  ```
- No `Form.vue`, adicionar prop `readonly` (booleano):
  - Quando `readonly={true}`, o `FormField` deve renderizar o componente Display em vez do Input.
- Essa lógica também deve ser extensível a nível de entidade: uma propriedade pode definir seu próprio `resolveDisplay` customizado.
- Na tabela (`ListTableView`), considerar usar os componentes Display em vez de renderizar valores brutos.

---

## 5. ✅ Entidades Relacionadas

### 5.1 ✅ Teste e implementação de entidade com relação

**Arquivos principais:** `app/entities/location.js` (novo), `app/components/input/InputRelation.vue`, `zenstack/models/Location.zmodel` (novo)

O tipo `relation` já está registrado, mas nunca foi testado com uma entidade real.

**O que precisa ser feito:**
- Criar a entidade `location` (local/filial) que tenha uma relação com `businessUnit`:
  ```js
  // app/entities/location.js
  export default {
    name: 'location',
    properties: {
      id: { type: 'code' },
      name: { type: 'text' },
      businessUnit: { type: 'relation', entity: 'businessUnit' }
    }
  }
  ```
- Criar o model ZenStack correspondente (`zenstack/models/Location.zmodel`) com a foreign key para `BusinessUnit`.
- Implementar/validar o `InputRelation.vue`:
  - Deve ser um select/autocomplete que busca os registros da entidade relacionada via `useRemoteList`.
  - **Importante:** o que é exibido no select é o valor de `display.property` da entidade relacionada (normalmente `name`).
- Testar no form: criar/editar um `location` selecionando um `businessUnit`.
- Testar no list: exibir a property de relação na tabela (mostrar o `name` do `businessUnit`, não o ID).
- Testar nos filtros: definir como filtrar por relação (ex.: dropdown com opções da entidade relacionada).

---

## 6. Internacionalização (i18n)

### 6.1 🟡 Padronizar e revisar i18n

**Arquivos principais:** `i18n/locales/pt-BR.yml`, todos os componentes e composables

O projeto usa apenas pt-BR. Existem inconsistências nas chaves de tradução e alguns componentes não estão traduzidos.

**O que precisa ser feito:**
- **Auditar o `pt-BR.yml`:** garantir que todas as chaves usadas nos componentes e composables existam.
- **Padronizar o namespace de chaves:**
  - Palavras básicas (`and`, `or`, etc.): raiz do YAML
  - Ações comuns compartilhadas: `actions.*` (ex.: `actions.cancel`, `actions.submit`)
  - Nome e coisas específicas do sistema: **renomear** `brand.*` para `system.*`
  - Mensagens comuns: `messages.*`
  - Entidades: `{entity}.*` (ex.: `businessUnit.properties.name`, `businessUnit.views.default`)
  - Componentes e composables: `{componentName}.*` e `{composableName}.*`
    - Exemplo: se o componente é `InputAddress.vue`, a chave será `inputAddress.placeholder`, `inputAddress.searchLabel`, etc.
- Verificar componentes que não estão traduzidos e padronizar.
- **Revisar o uso no servidor:** em `systemPrompt.js` e `registry.js`, que carregam o YAML diretamente, **garantir que em algumas situações o YAML seja carregado com o idioma (locale) atual do usuário**.
- Preparar a estrutura para um possível `en` no futuro (mover strings hardcoded para o YAML).

---

## 7. ✅ Refatoração Técnica

### 7.1 ✅ Refatorar `useRemoteList` para buscar contadores das abas separadamente

**Arquivos principais:** `app/composables/useRemoteList.js`, `app/composables/useEntityList.js`, `app/components/list/List.vue`

Atualmente o `useRemoteList` faz um `useCount` apenas da query ativa. Se o List tem múltiplas views (abas), não há como mostrar o total de registros de cada aba nos badges das tabs.

**O que precisa ser feito:**
- Criar uma função/composable que busque os contadores de cada view definida na entidade.
- Cada view pode ter seu próprio `query.filter` (ex.: a view `inactive` filtra `isActive: false`). A contagem de cada view deve usar o `where` baseado nesses filtros, **ignorando paginação, ordenação e seleção de campos**.
- **Prioridade de carregamento:**
  - Carregar os **dados da view ativa** primeiro (prioridade alta)
  - Carregar os **contadores de todas as views** em segundo plano (prioridade baixa)
- Idealmente, agrupar essas contagens em um único request batch com o ZenStack TanStack Query: https://zenstack.dev/docs/service/client-sdk/tanstack-query/
- Os contadores devem ser exibidos nos `UTabs` do `List.vue` (linha 45–52) como badge/counter.

---

## 8. Gestão de Usuários e Organização

### 8.1 🟡 Edição de perfil do usuário

**Arquivos principais:** `app/pages/app/profile.vue` (novo), `app/composables/useAuth.js`, `server/api/auth/`

O link para perfil já existe no menu, mas a página não está implementada.

**O que precisa ser feito:**
- Criar a página `/app/profile` com formulário para editar: nome, e-mail, foto.
- Usar o `useAuth.js` (que já expõe dados do usuário) para carregar os dados iniciais.
- Criar endpoint(s) no servidor para atualizar o perfil (ou usar o que o `better-auth` já fornece).
- Adicionar troca de senha com validação (senha atual + nova senha + confirmação).
- **Importante:** essa página **não é influenciada por organização**. O usuário pode ter várias organizações, mas essa página é sobre o usuário em si (dados globais).

---

### 8.2 🟡 Edição de organização e convite de usuários

**Arquivos principais:** `app/pages/app/organization.vue` (novo), `app/composables/useOrganization.js`, `app/components/organization/`, `zenstack/models/Invitation.zmodel`, `zenstack/models/Member.zmodel`

Os models `Invitation` e `Member` já existem no ZenStack.

**O que precisa ser feito:**
- Criar página `/app/organization` para editar dados da organização (nome, logo, configurações globais, etc.).
- Listar membros atuais com seus papéis/roles.
- Implementar fluxo de convite:
  1. Formulário de e-mail → criar `Invitation` no banco
  2. Enviar e-mail com link de aceite (usar o `mailer` já existente em `server/utils/mailer/`)
  3. Link de aceite → criar `Member` e vincular à organização
- Permitir remover membros e reenviar convites pendentes.

---

## 9. Permissionamento

### 9.1 🔴 Permissionamento granular (permissions)

**Arquivos principais:** `zenstack/models/Permission.zmodel` (novo), `app/composables/usePermission.js` (novo), `app/middleware/`, definições de entidades

**Importante:** O permissionamento **não é ligado à organização**, mas sim algo **global do sistema**. Já as **roles** sim, serão criadas por organização (ver item 9.2).

**O que precisa ser feito:**
- Definir o modelo de dados de permissão (tabela `Permission`) com campos:
  - `resource` (entidade ou recurso, ex.: `businessUnit`, `location`)
  - `action` (create, read, update, delete, export, import, etc.)
  - Associação com `Member` ou `Role`
- Usar as **policies do ZenStack** (`@@allow`/`@@deny` nos `.zmodel`) para enforçar permissões no nível do banco, removendo a necessidade de checking manual no código.
  - Documentação: https://zenstack.dev/docs/reference/zmodel/access-policy
- No front, criar composable `usePermission(resource, action)` que retorna `true/false` verificando as permissões do membro logado.
- Condicionar ações no List (criar, editar, deletar, import, export) e no Form (salvar) baseado nas permissões.
- Condicionar itens do menu lateral.
- **Automação:** pensar num esquema para os arquivos de entidades (`app/entities/*.js`) poderem declarar permissões locais de forma declarativa (ex.: `permissions: { create: 'manager', read: 'all' }`).

---

### 9.2 🔴 Grupos de permissões (roles)

**Arquivos principais:** `zenstack/models/Role.zmodel` (novo), associação `Role ↔ Permission ↔ Member`

Depende do item 9.1.

**O que precisa ser feito:**
- Criar o model `Role` com relação muitos-para-muitos com `Permission`.
- Associar `Member` a um ou múltiplos `Role`.
- **Roles personalizadas:** as roles estarão no escopo de cada **organização**. Ou seja, cada organização terá suas próprias roles.
- **Roles padrão:**
  - Criar roles pré-definidas (ex.: `admin`, `manager`, `viewer`)
  - A role `admin` será **permanente** (não pode ser deletada nem editada)
  - **Automatizar a criação de roles padrão** quando uma nova organização é criada (usar hook no ZenStack ou no código de criação de organização)
- Na página de organização, permitir atribuir roles aos membros.
- Permitir criar roles customizadas com seleção granular de permissões.

---

## 10. Funcionalidades de Plataforma

### 10.1 🔴 Integração com Stripe para gestão de assinaturas

**Arquivos principais:** `server/api/stripe/` (novo), `zenstack/models/Subscription.zmodel` (novo), `app/pages/app/billing.vue` (novo), configuração better-auth

**O que precisa ser feito:**
- Instalar e configurar o SDK do Stripe (`stripe` no server).
- **Integrar com better-auth:** https://www.better-auth.com/docs/plugins/stripe
- Criar endpoints:
  - Criar customer no Stripe
  - Criar checkout session
  - Webhook de eventos (checkout.completed, invoice.paid, subscription.updated, subscription.cancelled)
- Criar model `Subscription` no ZenStack vinculado a `Organization`.
- Implementar página de billing (`/app/billing`) com:
  - Plano atual
  - Histórico de faturas
  - Botão para upgrade/downgrade
  - Gerenciar método de pagamento
- **Middleware de verificação de assinatura:**
  - Verificar se a organização tem assinatura ativa antes de permitir acesso
  - **Em caso de assinatura expirada:** barrar o acesso a todas as páginas, **exceto** `/app/billing`
- Definir os planos:
  - Planos **mensais** e **anuais**
  - Limites por plano (ex.: número de membros, número de registros, features disponíveis)
- **Futuro:** cobrar adicionais por uso (ex.: custo variável mensal pelo uso da IA).

---

### 10.2 🟡 Busca global

**Arquivos principais:** `app/components/app/AppSearch.vue` (novo), `server/api/search/` (novo endpoint) ou views do ZenStack

**O que precisa ser feito:**
- Criar um componente de busca global no header da aplicação (`AppSearch.vue`), acionado por atalho de teclado (`⌘K` ou `Ctrl+K`).
- Buscar em todas as entidades registradas, usando os campos marcados como `searchable: true` nas properties.
- Exibir resultados agrupados por entidade, com link para o item.
- Considerar debounce e limite de resultados por entidade.
- **Performance:** considerar usar **views do ZenStack** para criar uma estratégia otimizada de busca global: https://zenstack.dev/docs/reference/zmodel/view
  - Avaliar se uma view agregada de todas as entidades facilita a performance, mas sem aumentar a complexidade.
- No servidor, criar um endpoint que itere sobre as entidades do registry e faça queries paralelas com `contains`.

---

### 10.3 🟡 Sistema de notificações

**Arquivos principais:** `zenstack/models/Notification.zmodel` (novo), `app/components/app/AppNotifications.vue` (novo), `server/api/notifications/` (novo)

**O que precisa ser feito:**
- Criar model `Notification` com: `type`, `title`, `message`, `read`, `createdAt`, relação com `User` e `Organization`.
- Criar endpoint para listar, marcar como lida, e marcar todas como lidas.
- Criar componente de sino/badge no header que mostra contagem de não lidas.
- Criar dropdown/painel de notificações com lista e ações.
- Definir os eventos que geram notificações (ex.: convite recebido, ação em registro compartilhado). Incrementar conforme necessário.
- **Notificações nativas:** o usuário precisa receber notificação nativa quando não está com a aplicação aberta.
  - Considerar usar **Push API** (service workers + Web Push): https://developer.mozilla.org/en-US/docs/Web/API/Push_API
  - **Escalabilidade com baixo custo:** evitar WebSockets contínuos. Opções:
    - Polling com intervalo longo (ex.: a cada 30s quando a aba está ativa)
    - Push notifications via service worker (quando a aba está inativa ou fechada)
- Avaliar libs/serviços externos para simplificar (ex.: OneSignal, Firebase Cloud Messaging), mas priorizar soluções nativas.

---

### 10.4 🟡 Gerador de relatórios customizáveis

**Arquivos principais:** `app/pages/app/reports/index.vue` (novo), `app/pages/app/reports/[id].vue` (novo), `zenstack/models/Report.zmodel` (novo)

Criar um sistema completo de relatórios com templates customizáveis, suporte a relações profundas, agregações e campos computados.

**O que precisa ser feito:**
- Criar tela global `/app/reports` onde será possível listar e gerenciar relatórios.
- Criar interface de criação de relatório (`/app/reports/new`) com formulário que inclui:
  - **Nome do relatório**
  - **Visibilidade:** público (toda a organização) ou privado (apenas o criador)
  - **Seleção de entidade de origem:** dropdown das entidades disponíveis
  - **Seleção de campos:** 
    - Campos diretos da entidade
    - **Campos de relações:** se a entidade tem relações, permitir selecionar campos das entidades relacionadas
    - **Relações profundas:** se uma relação também tem relações, permitir navegar quantos níveis forem necessários
  - **Reordenação de campos:** drag-and-drop para reorganizar ordem das colunas
  - **Filtros:** reutilizar a lógica do `ListFilter` para aplicar filtros aos dados
  - **Ordenação:** permitir ordenar por qualquer campo
  - **Agrupamento:** agrupar resultados por campos específicos
  - **Agregações:** usar a API de aggregates do ZenStack para somar, contar, calcular médias, etc.
  - **Campos computados:** permitir criar campos personalizados com fórmulas (ex.: `total = quantidade * preço`)
- Permitir salvar o template de relatório para reutilização.
- Na tela de visualização do relatório (`/app/reports/[id]`):
  - Gerar preview dos dados em tabela
  - Permitir aplicar filtros adicionais em tempo real
  - Exportar para Excel e/ou CSV (o projeto já tem `xlsx`)
- Criar model `Report` no ZenStack para armazenar os templates de relatórios.

---

## 11. Inteligência Artificial (Chat)

### 11.1 🟡 Melhorar consumo e exibição de dados do sistema no Chat

**Arquivos principais:** `app/pages/app/chat/`, `app/components/chat/`, `server/utils/ai/tools/list.js`

**O que precisa ser feito:**
- Revisar o `list.js` (12.9KB): garantir que está passando os dados de forma eficiente para o LLM (não enviar campos desnecessários).
- **Usar `aiDescription`:** entidades e propriedades podem ter um atributo `aiDescription` (string descritiva) que será usado pelo chat para entender melhor o contexto.
  - Exemplo: `businessUnit.aiDescription = "Unidade de negócio representa uma filial ou departamento da empresa"`
- Melhorar a exibição dos resultados no chat: usar componentes visuais (tabelas ou, no futuro, cards) em vez de depender apenas do markdown do LLM.
- Considerar paginação nos resultados do chat (ou se conseguir integrar e exibir o List.vue melhor ainda).
- Usar as **labels traduzidas** (do i18n) nos headers das tabelas/cards em vez dos nomes técnicos das properties.

---

### 11.2 🟡 Melhorar prompts e criar tools de consulta

**Arquivos principais:** `server/utils/systemPrompt.js`, `server/utils/ai/registry.js`, `server/utils/ai/tools/`

**O que precisa ser feito:**
- Refinar o system prompt (`systemPrompt.js`) com exemplos de uso (few-shot) para melhorar a qualidade das respostas.
- Melhorar o `describeEntities()` (em `registry.js`, linha 67) para incluir: relações, enums/options de selects, e exemplos de valores.
- Adicionar tool de criação/edição de registros (com confirmação do usuário antes de executar, respeitando o guardrail existente).
- Considerar uma tool de navegação (abrir uma página específica da aplicação).
- **Tool de consulta de entidades:**
  - No futuro, teremos muitas entidades e não faz sentido enviar todas no prompt inicial.
  - Enviar apenas os **títulos das entidades** no prompt inicial.
  - Criar uma tool `describeEntity(entityName)` que retorna a descrição completa de uma entidade específica (properties, relations, aiDescription, etc.).
  - O LLM chama essa tool quando precisa de detalhes sobre uma entidade para responder ao usuário.

---

## 12. Outros

### 12.1 ✅ Ação de excluir registro (delete)

**Arquivos principais:** `app/composables/useEntityDelete.js` (novo), `app/composables/useEntityForm.js`, `app/composables/useEntityList.js`, `app/components/form/Form.vue`, `app/components/list/List.vue`

Não existe nenhuma ação de exclusão (delete) implementada, nem no List (delete em batch ou individual) nem no Form.

**O que precisa ser feito:**
- **Criar composable `useEntityDelete.js`** para centralizar a lógica de exclusão:
  - Expor mutation `client[key].useDelete()` do ZenStack
  - Função `deleteRecord(id)` que retorna uma Promise
  - Função `deleteRecords(ids)` para exclusão em batch
  - Estados `isDeleting` e `error`
  - Integração com confirmação via `useConfirm` (ver item 12.3)
- No `Form.vue`, adicionar botão de deletar (se não for novo registro):
  - Usar `useEntityDelete` para obter a função de delete
  - Chamar `useConfirm` antes de executar
  - Redirecionar para a listagem após exclusão bem-sucedida
- No `List.vue`, adicionar:
  - Ação de deletar individual em cada linha da tabela
  - Ação de deletar em batch quando houver registros selecionados (ver item 12.4)
  - Usar `useEntityDelete` em ambos os casos

---

### 12.2 ✅ Estado vazio (empty state) no List

Quando a lista não tem registros, não existe nenhuma UI de empty state.

**O que precisa ser feito:**
- Criar componente de empty state com ilustração, texto contextualizado e botão de ação.
- **Importante:** diferenciar dois cenários:
  - **Empty state verdadeiro:** não há nenhum registro cadastrado naquela entidade (exibir mensagem como "Nenhuma unidade de negócio encontrada. Criar a primeira?")
  - **Sem resultados por filtro/busca:** há registros, mas a busca/filtro não retornou nada (exibir mensagem como "Nenhum resultado encontrado.")

---

### 12.3 ✅ Confirmação de ações destrutivas (ModalConfirm e ModalAlert)

**Arquivos principais:** `app/components/modal/ModalConfirm.vue`, `app/components/modal/ModalAlert.vue` (novo), `app/composables/useConfirm.js` (novo), `app/composables/useAlert.js` (novo)

O componente `ModalConfirm.vue` existe, mas é usado em apenas um local (deletar chat) e tem um **erro de arquitetura**: não tem como aguardar uma ação assíncrona antes de fechar.

**O que precisa ser feito:**
- Refatorar `ModalConfirm.vue` para um padrão baseado em composables:
  - Criar `useConfirm(message, options)` que retorna uma função que pode receber uma **ação assíncrona**
  - O modal deve permanecer aberto enquanto a ação assíncrona está sendo executada (mostrar loading)
  - **Se erro:** exibir mensagem de erro no próprio modal e não fechar
  - **Se sucesso:** fechar o modal automaticamente
- Criar `ModalAlert.vue` (para mensagens informativas sem confirmação).
- Criar `useAlert(message, options)` que exibe uma mensagem e espera o usuário clicar em OK.
- Exemplo de uso:
  ```js
  const confirm = useConfirm()
  
  // O modal abre, usuário confirma, a ação executa, e o modal fecha automaticamente
  await confirm('Tem certeza que deseja deletar?', async () => {
    await deleteRecord()
  })
  ```

---

### 12.4 ✅ Seleção de registros no List (checkbox)

Para habilitar ações em batch (excluir vários, exportar selecionados, etc.), a tabela precisa de uma coluna de checkbox com seleção individual e "selecionar todos".

**O que precisa ser feito:**
- O `UTable` do Nuxt UI já tem essa funcionalidade. Apenas habilitar via props.
- Documentação: https://ui.nuxt.com/docs/components/table
- Criar estado de seleção no `useEntityList`:
  ```js
  const selectedRows = ref([])
  ```
- As ações em batch devem estar vinculadas à entidade através da chave `batchActions`:
  ```js
  // app/entities/businessUnit.js
  export default {
    // ...
    batchActions: {
      delete: { icon: 'i-tabler-trash', label: 'Deletar selecionados' },
      export: { icon: 'i-tabler-file-export', label: 'Exportar selecionados' }
    }
  }
  ```

---

### 12.5 🟢 Testes automatizados

Não existe nenhuma estrutura de testes no projeto (nem unitários, nem e2e).

**O que precisa ser feito:**
- Adicionar testes unitários para os composables usando **Vitest**.
- Adicionar testes e2e para os fluxos principais usando **Playwright** ou **Cypress**.

> Comentário: Vai ser a última coisa que faremos no projeto.

---

### 12.6 🟢 Error boundary global

Não há tratamento de erro global na aplicação. Se um componente quebra, toda a página cai.

**O que precisa ser feito:**
- Implementar um `error.vue` do Nuxt para capturar erros globais: https://nuxt.com/docs/getting-started/error-handling
- Considerar error boundaries em componentes críticos (ex.: List, Form).
- **Personalizar as páginas de erro do Nuxt** para que tenham a identidade visual da aplicação (404, 500, etc.).

---

## Ordem de execução sugerida

```
Fase 1 — Fundação (corrigir o que está quebrado)
├── 1.1 Redesenhar filtros na URL
├── 1.2 Forçar validação Zod no Form
├── 1.3 Parsear erros de servidor no Form
├── 1.4 Traduzir erros do Zod
├── 1.5 Tratamento de erros de fetch no List
├── 2.1 Skeleton no List
└── 2.2 Skeleton no Form

Fase 2 — Sistema de tipos robusto
├── 3.1 Auditoria de property types
├── 5.1 Teste com entidade relacionada
└── 4.2 Componentes Display (readonly)

Fase 3 — UX e visualização
├── 4.1 Visualização em Cards
├── 3.2 Suporte a máscara em property types
├── 3.3 Sistema de máscaras dinâmicas contextuais
├── 3.4 Campo telefone
├── 3.5 Campo endereço
├── 3.6 Campo de upload (InputFile)
├── 12.1 Ação de excluir
├── 12.2 Empty state
├── 12.3 ModalConfirm e ModalAlert
└── 12.4 Seleção de registros

Fase 4 — Plataforma
├── 6.1 Padronizar i18n
├── 7.1 Refatorar contadores de abas
├── 8.1 Edição de perfil
├── 8.2 Edição de organização
├── 10.2 Busca global
└── 10.3 Notificações

Fase 5 — Monetização e segurança
├── 9.1 Permissionamento granular
├── 9.2 Grupos de permissões (roles)
└── 10.1 Integração Stripe

Fase 6 — Inteligência e relatórios
├── 11.1 Melhorar dados no Chat
├── 11.2 Melhorar prompts e tools
└── 10.4 Gerador de relatórios

Bônus (quando a oportunidade surgir)
├── 12.5 Testes automatizados
└── 12.6 Error boundary global
```
