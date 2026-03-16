import { tool, zodSchema } from 'ai'
import { z } from 'zod'

export function createSpreadsheetTool() {
  return tool({
    description: [
      'Creates a spreadsheet file requested by the user, providing data formatted as rows/columns.',
      'Use this tool when the user asks to generate, export, transform, or download data as an Excel (.xlsx) or CSV file.',
      '',
      '## Guidelines',
      '- Determine the appropriate format (xlsx or csv) based on the user\'s request. Default to xlsx.',
      '- "filename" should be short, descriptive, and omit the extension.',
      '- "columns" should be an array of column headers (strings).',
      '- "data" should be an array of objects, where each object represents a row. The keys of these objects MUST match the values provided in "columns".',
      '- For example, if columns is ["Name", "Value"], data could be [{ "Name": "Apple", "Value": "10" }].',
      '',
      '## Important',
      '- After calling this tool, the assistant MUST respond with EXACTLY ONE short sentence (<= 80 chars) confirming the spreadsheet is ready for download.',
      '- The assistant MUST NOT include the raw data or rows in the textual conversation.'
    ].join('\n'),

    inputSchema: zodSchema(
      z.object({
        filename: z.string()
          .max(50)
          .describe('The name of the generated file (without extension). Example: "financial_report".'),

        format: z.enum(['xlsx', 'csv'])
          .describe('The format of the spreadsheet document.'),

        columns: z.array(z.string())
          .min(1)
          .describe('An array of column names used in the spreadsheet.'),

        data: z.array(z.record(z.string(), z.unknown()))
          .min(1)
          .describe('An array of row objects mapping each column to a value.')
      })
    ),

    execute: async ({ filename, format, columns, data }) => {
      // Return structured data to the frontend for generation.
      return {
        filename,
        format,
        columns,
        data
      }
    }
  })
}
