# Princípios Fundamentais
Simplicidade, clareza e manutenção. DRY e KISS são inegociáveis.

# Stack & Componentes
- Use componentes existentes do Nuxt UI como padrão
- Minimize dependências externas
- Evite criar novos componentes sem justificativa forte

# Código Limpo
- Aspas simples ('') sempre
- Nomes descritivos, sem abreviações
- Limite de 80 caracteres no `<script>` (template flexível)
- Conceitos: programação funcional, SOLID, código limpo
- Comentários apenas para explicar "porquê", não "o quê"

# Convenções JavaScript/Vue
- `const` por padrão, `let` NUNCA, `var` JAMAIS
- Prefira `for..of`/`for..in` ao invés de combinar `Object.keys()`/`values()`/`entries()`/`forEach()`/`map()`
- Prefira `push` e `splice` para mutação de arrays, evitando métodos que retornam novos arrays
- Prefira spread operator ou `Object.assign` para objetos, evitando mutação direta
- Prefira retornos antecipados ou ternários a invés de `else` (quando mais simples)

# Estado, Persistência e Performance
- Prefira `computed` para estado derivado e sincronização reativa
- Use `watch` apenas quando houver efeito colateral inevitável
- Para persistência local, prefira `useStorage` em vez de `localStorage` manual
- Evite variáveis intermediárias desnecessárias; simplifique o fluxo de dados

# URL e Hidratação (Nuxt)
- Evite mismatch de hidratação SSR/CSR; não acesse storage no SSR

# Regra de Ouro
Nunca altere código sem instrução explícita.
