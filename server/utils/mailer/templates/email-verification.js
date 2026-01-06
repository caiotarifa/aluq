import { layout } from './layout'

export default function ({ name, url }) {
  const firstName = name?.split(' ')[0] || 'Olá'

  return layout(`
    <h2>Verifique seu e-mail</h2>
    <p>
      ${firstName}, obrigado por se cadastrar!<br>
      Clique no botão abaixo para verificar seu endereço de e-mail.
    </p>
    <a href="${url}" class="button">Verificar E-mail</a>
    <p style="margin-top: 24px; font-size: 14px;">
      Se você não criou uma conta, pode ignorar este e-mail.
    </p>
  `)
}
