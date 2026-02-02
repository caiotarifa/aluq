# Princípios Fundamentais
Simplicidade, clareza e manutenção. DRY e KISS são inegociáveis.

# Stack & Componentes
- Use componentes existentes do NuxtUI como padrão
- Minimize dependências externas
- Evite criar novos componentes sem justificativa forte

# Código Limpo
- Aspas simples ('') sempre
- Nomes descritivos, sem abreviações
- Limite de 80 caracteres no `<script>` (template flexível)
- Conceitos: programação funcional, SOLID, código limpo
- Comentários apenas para explicar "porquê", não "o quê"

# Convenções JavaScript/Vue
- `const` por padrão, `let` apenas quando for inevitável
- `for..of`/`for..in` > Múltiplos `Object.keys()`/`values()`/`entries()`/`forEach()`/`map()`
- Retornos antecipados ou ternários > `if/else` (quando mais simples)
- Evite `watch`

# Regra de Ouro
Nunca altere código sem instrução explícita.