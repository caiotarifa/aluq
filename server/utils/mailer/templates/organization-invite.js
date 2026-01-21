import { layout } from './layout.js'

export default function ({ inviterName, organizationName, inviteeName, url }) {
  const firstName = inviteeName?.split(' ')[0] || 'Olá'
  const inviterFirstName = inviterName?.split(' ')[0] || 'Um colega'

  return layout(`
    <h2>Convite para organização</h2>
    <p>
      ${firstName}, ${inviterFirstName} convidou você para fazer parte da organização <strong>${organizationName}</strong>!
    </p>
    <p>
      Aceite o convite para começar a colaborar com a equipe.
    </p>
    <a href="${url}" class="button">Aceitar Convite</a>
    <p style="margin-top: 24px; font-size: 14px;">
      Se você não estava esperando este convite, pode ignorar este e-mail.<br>
      O convite expira em 7 dias.
    </p>
  `)
}
