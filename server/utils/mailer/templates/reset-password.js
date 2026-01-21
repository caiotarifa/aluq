import { layout } from './layout.js'

export default function ({ name, url }) {
  const firstName = name?.split(' ')[0] || 'Olá'

  return layout(`
    <h2>Redefinir sua senha</h2>
    <p>
      ${firstName}, recebemos uma solicitação para redefinir sua senha.<br>
      Clique no botão abaixo para criar uma nova senha.
    </p>
    <a href="${url}" class="button">Redefinir Senha</a>
    <p style="margin-top: 24px; font-size: 14px;">
      Se você não solicitou a redefinição de senha, pode ignorar este e-mail.<br>
      O link expira em 1 hora.
    </p>
  `)
}
