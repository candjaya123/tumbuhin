import { z } from 'zod';

const AccountSchema = z.object({
  code: z.string().optional(),
  name: z.string(),
  type: z.string().optional(),
});

export const AiCoaSchema = z.object({
  business_profile: z.object({
    industry: z.string(),
    scale: z.string(),
    complexity: z.string(),
  }),
  assumptions: z.array(z.string()),
  enabled_modules: z.array(z.string()),
  chart_of_accounts: z.object({
    assets: z.array(AccountSchema),
    liabilities: z.array(AccountSchema),
    equity: z.array(AccountSchema),
    revenue: z.array(AccountSchema),
    cost_of_goods_sold: z.array(AccountSchema),
    expenses: z.array(AccountSchema),
    tax_accounts: z.array(AccountSchema),
    contra_accounts: z.array(AccountSchema),
  }),
  system_design_notes: z.array(z.string()).optional(),
});

export type AiCoaResponse = z.infer<typeof AiCoaSchema>;
