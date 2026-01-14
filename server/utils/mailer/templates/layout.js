export function layout(content) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aluq</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
          color: #1a1a1a;
          line-height: 1.7;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .wrapper {
          width: 100%;
          padding: 60px 20px;
        }
        .container {
          max-width: 560px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        }
        .header {
          padding: 48px 48px 32px;
          text-align: center;
          border-bottom: 1px solid #f0f0f0;
        }
        .logo {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: #1a1a1a;
          margin: 0;
        }
        .content {
          padding: 48px;
        }
        .content h2 {
          font-size: 26px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 16px;
          line-height: 1.3;
          letter-spacing: -0.5px;
        }
        .content p {
          font-size: 16px;
          color: #64748b;
          margin: 0 0 24px;
          line-height: 1.7;
        }
        .content p strong {
          color: #1a1a1a;
          font-weight: 600;
        }
        .button {
          display: inline-block;
          padding: 16px 40px;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.2px;
          margin: 8px 0;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
          margin: 32px 0;
        }
        .footer {
          padding: 32px 48px 48px;
          text-align: center;
        }
        .footer p {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
          line-height: 1.6;
        }
        .footer a {
          color: #64748b;
          text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
          .wrapper {
            padding: 20px 10px;
          }
          .header, .content, .footer {
            padding-left: 24px;
            padding-right: 24px;
          }
          .content h2 {
            font-size: 22px;
          }
          .button {
            padding: 14px 32px;
            font-size: 14px;
          }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1 class="logo">Aluq</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Aluq. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
