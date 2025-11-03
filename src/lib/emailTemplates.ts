/**
 * Email template engine with variable substitution
 */

export interface TemplateVariables {
  [key: string]: string | number | undefined;
}

/**
 * Replace template variables in a string
 * Supports: {Variable}, {variable}, {VARIABLE}
 */
export function replaceTemplateVariables(
  template: string,
  variables: TemplateVariables
): string {
  let result = template;

  // Replace all {Variable} patterns
  const regex = /\{([^}]+)\}/g;
  result = result.replace(regex, (match, variableName) => {
    const value = variables[variableName];
    if (value !== undefined && value !== null) {
      return String(value);
    }
    return match; // Keep original if variable not found
  });

  return result;
}

/**
 * Extract variables from a template string
 * Returns array of unique variable names
 */
export function extractTemplateVariables(template: string): string[] {
  const regex = /\{([^}]+)\}/g;
  const variables = new Set<string>();
  let match;

  while ((match = regex.exec(template)) !== null) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}

/**
 * Get available variables from a contact object
 */
export function getContactVariables(contact: any): TemplateVariables {
  return {
    // Basic fields
    FirstName: contact.firstName || '',
    LastName: contact.lastName || '',
    FullName: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
    Email: contact.email || '',
    Phone: contact.phone || '',
    
    // Job info
    Title: contact.title || '',
    Company: contact.company || '',
    
    // Location
    Location: contact.location || '',
    
    // Other
    Source: contact.source || '',
    LinkedInUrl: contact.linkedInUrl || '',
    
    // Custom fields (if any)
    ...contact.customFields,
  };
}

/**
 * Validate that all required variables are available
 */
export function validateTemplateVariables(
  template: string,
  variables: TemplateVariables
): { valid: boolean; missing: string[] } {
  const requiredVars = extractTemplateVariables(template);
  const missing = requiredVars.filter(
    (varName) => variables[varName] === undefined || variables[varName] === null || variables[varName] === ''
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Process email template with contact data
 */
export function processEmailTemplate(options: {
  subject: string;
  body: string;
  contact: any;
  additionalVariables?: TemplateVariables;
}): { subject: string; body: string } {
  const variables = {
    ...getContactVariables(options.contact),
    ...options.additionalVariables,
  };

  return {
    subject: replaceTemplateVariables(options.subject, variables),
    body: replaceTemplateVariables(options.body, variables),
  };
}

/**
 * Common email templates
 */
export const DEFAULT_TEMPLATES = {
  introduction: {
    name: 'Introduction Email',
    subject: 'Quick introduction - {Company}',
    body: `Hi {FirstName},

I hope this email finds you well. I came across your profile and was impressed by your work at {Company}.

I'd love to connect and explore potential opportunities for collaboration.

Looking forward to hearing from you!

Best regards`,
    variables: ['FirstName', 'Company'],
  },
  followUp: {
    name: 'Follow Up Email',
    subject: 'Following up on my previous email',
    body: `Hi {FirstName},

I wanted to follow up on my previous email. I understand you're busy, but I believe there could be valuable synergies between us.

Would you have 15 minutes this week for a quick call?

Best regards`,
    variables: ['FirstName'],
  },
  coldOutreach: {
    name: 'Cold Outreach',
    subject: 'Helping {Company} with [specific problem]',
    body: `Hi {FirstName},

I noticed {Company} is working in [industry/area]. We've helped similar companies [achieve specific result].

I'd love to share some insights that might be valuable for {Company}.

Would you be open to a brief conversation?

Best regards`,
    variables: ['FirstName', 'Company'],
  },
};
