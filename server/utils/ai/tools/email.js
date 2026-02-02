import { tool, zodSchema } from 'ai'
import { z } from 'zod'

export function createEmailTool() {
  return tool({
    description: [
      'Creates a professionally formatted email with subject and content.',
      'Use this tool when the user asks to write, draft, or compose an email.',
      '',
      '## Guidelines',
      '- Subject must be clear, concise, and professional.',
      '- Content should be divided into paragraphs when appropriate.',
      '- Maintain a professional tone suitable for the context.',
      '- Include greeting, message body, and closing when appropriate.',
      '- Include a signature with user\'s name and organization, use <br> for line breaks.',
      '',
      '## Important',
      '- After calling this tool, DO NOT repeat the email content in your response.',
      '- The email will be rendered in a dedicated UI component.',
      '- Just provide a small brief text, without the subject or content.'
    ].join('\n'),

    inputSchema: zodSchema(
      z.object({
        to: z.string()
          .optional()
          .describe('Recipient email address (optional if you know it).'),

        subject: z.string()
          .max(100)
          .describe('Email subject (maximum 100 characters).'),

        content: z.string()
          .describe('Email body content. Supports markdown formatting (headings, bold, italic, lists, etc.). Use markdown syntax to format the email professionally.')
      })
    ),

    execute: async ({ to, subject, content }) => {
      return {
        to,
        subject,
        content
      }
    }
  })
}
