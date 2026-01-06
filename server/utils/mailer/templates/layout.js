export function layout(content) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aluq</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f4f4f5;
          color: #18181b;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .card {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .logo {
          text-align: center;
          margin-bottom: 32px;
        }
        .logo h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #18181b;
        }
        .content {
          text-align: center;
        }
        .content h2 {
          margin: 0 0 16px;
          font-size: 24px;
          font-weight: 600;
          color: #18181b;
        }
        .content p {
          margin: 0 0 24px;
          font-size: 16px;
          color: #52525b;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background-color: #18181b;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
        }
        .footer {
          margin-top: 32px;
          text-align: center;
          font-size: 14px;
          color: #a1a1aa;
        }
        .footer p {
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">
            <h1>Aluq</h1>
          </div>
          <div class="content">
            ${content}
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Aluq. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
