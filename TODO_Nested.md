Sistema completo de nested properties para relações

Implementar sistema completo para exibir, filtrar, ordenar e configurar propriedades de entidades relacionadas (nested properties).

**Contexto e exemplo:**
A entidade `location` tem relação com `businessUnit`. Queremos exibir na tabela de locations as colunas "Empresa" (businessUnit.name) e "Empresa / Documento" (businessUnit.taxId), além de permitir filtrar e ordenar por esses campos.

---

#### Etapa 1: Criar estrutura de entidades relacionadas

**1.1. Definir entidade com relação:**
```js
// app/entities/location.js
export default {
  name: 'location',

  hasOne: ['businessUnit'],  // Declara relação 1:1

  properties: {
    id: {
      type: 'code'
    },
    name: {
      type: 'text',
      searchable: true
    },
    businessUnitId: {
      type: 'relation',
      entity: 'businessUnit'  // Aponta para qual entidade
    }
  },

  views: {
    default: {
      properties: [
        'name',
        'businessUnit.name',      // ← Nested property
        'businessUnit.taxId'      // ← Nested property
      ]
    }
  }
}
```

```js
// app/entities/businessUnit.js
export default {
  name: 'businessUnit',

  hasMany: ['location'],  // Declara relação 1:1

  ...
}
```

**1.2. Criar model ZenStack:**
```zmodel
// zenstack/models/Location.zmodel
model Location with BaseModel {
  businessUnit BusinessUnit @relation(fields: [businessUnitId], references: [id], onDelete: Cascade)
  businessUnitId String

  name String @length(1)

  @@allow('all', businessUnit.organizationId == auth().organizationId)
  @@index([businessUnitId])
}
```

---

#### Etapa 2: Processar dados com nested properties no List.vue

Centralizar o processamento de nested properties uma única vez em List.vue`, evitando duplicação nas views.

Resolve nested properties nos dados, transformando:

```js
{ businessUnit: { name: 'X' } } → { 'businessUnit.name': 'X' }

{ locations: [{ name: 'A' }, { name: 'B' }] } → { 'locations.name': 'A, B' }
```

Depois, atualizar viewProperties para usar labels hierárquicos.

---

#### Etapa 3: Ajustar ListTableView para usar id + accessorFn

Temos que modificar a geração de colunas em `ListTableView.vue`.

TanStack Table requer `column.id` + `accessorFn` para keys com dot-notation.

---

#### Etapa 4: Adicionar nested properties ao ListEditView

Alterar o comportamento das propriedades do ListEditView para que exista um botão de "adicionar propriedade", ao clicar, uma lista com todas as propriedades disponíveis (incluindo nested) será exibida, e ao selecionar uma propriedade, ela seja adicionada à lista de propriedades. Ao salvar as configurações, as propriedades selecionadas (incluindo nested) devem ser exibidas na visualização, a URL atualizada e as configurações salvas no localStorage.

Ainda deve ser posssível reordenar e pinar qualquer propriedade, incluindo as nested.

---

#### Etapa 5: Configurar filtros por relação (ID da FK)

O filtro deve utilizar o componente `InputRelation`, que é um select com busca para selecionar o registro relacionado. O filtro deve funcionar comparando o ID da FK (ex: `businessUnitId`) com o valor selecionado.

Os operadores disponíveis para propriedades do tipo relation devem se adaptar ao contexto (hasOne, hasMany) equals, notEquals, in, notIn, isEmpty, isNotEmpty.

---

#### Etapa 6: Desabilitar sort por nested (limitação Zenstack)

Marcar nested properties (relation) como `sortable: false` programaticamente, o que deve refletir tanto no botão de sort da ListTableView quanto no ListSort.

---

#### Limitações conhecidas:

- ⚠️ **Sort por nested desabilitado:** Zenstack não suporta nested orderBy. Mesmo que seja possível construir a query, as policies de acesso não funcionariam corretamente. Por isso, desabilitamos a opção de sort para nested properties.
- ⚠️ **Filtro apenas por ID:** Não suporta filtrar por nested properties (ex: `businessUnit.name contains "X"`), apenas pelo ID da FK.

---

#### Testes necessários:

1. **Labels:** Verificar "Empresa" vs "Empresa / Documento" em `/app/locations`
2. **ListEditView:** Abrir editor de colunas, verificar nested properties listadas
3. **Filtros:** Testar filtro por businessUnitId (equals, in, isEmpty)
4. **Dados:** Verificar valores renderizados corretamente na tabela
5. **hasMany:** Testar com array join (ex: businessUnit.locations.name)
