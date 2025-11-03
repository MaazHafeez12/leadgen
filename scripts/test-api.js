/**
 * API Testing Script
 * 
 * Run this script to test all API endpoints:
 * node scripts/test-api.js
 * 
 * Or use the PowerShell wrapper:
 * .\scripts\test-api.ps1
 */

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(method, path, body = null, description = '') {
  const url = `${API_BASE}${path}`;
  log(`\n${description || `${method} ${path}`}`, 'cyan');
  log(`→ ${url}`, 'blue');

  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
      log(`Body: ${JSON.stringify(body, null, 2)}`, 'yellow');
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
      log(`✓ Success (${response.status})`, 'green');
      console.log(JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      log(`✗ Failed (${response.status})`, 'red');
      console.log(JSON.stringify(data, null, 2));
      return { success: false, data };
    }
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n='.repeat(60), 'cyan');
  log('API ENDPOINT TESTS', 'cyan');
  log('='.repeat(60), 'cyan');

  // Health Check
  log('\n1. HEALTH CHECK', 'yellow');
  await testEndpoint('GET', '/api/health', null, 'Check API health');

  // Companies
  log('\n\n2. COMPANY ENDPOINTS', 'yellow');
  
  // Create company
  const createCompanyResult = await testEndpoint(
    'POST',
    '/api/companies',
    {
      name: 'Test Company Inc',
      industry: 'Technology',
      location: 'San Francisco, CA',
      size: '51-200',
      website: 'https://test-company.com',
      tags: ['test', 'demo'],
    },
    'Create a new company'
  );
  
  const companyId = createCompanyResult.success 
    ? createCompanyResult.data.data._id 
    : null;

  // List companies
  await testEndpoint('GET', '/api/companies?page=1&limit=10', null, 'List companies');

  // Search companies
  await testEndpoint('GET', '/api/companies?search=test', null, 'Search companies');

  // Get single company
  if (companyId) {
    await testEndpoint('GET', `/api/companies/${companyId}`, null, 'Get company by ID');

    // Update company
    await testEndpoint(
      'PUT',
      `/api/companies/${companyId}`,
      { industry: 'Software' },
      'Update company'
    );
  }

  // Contacts
  log('\n\n3. CONTACT ENDPOINTS', 'yellow');
  
  // Create contact
  const createContactResult = await testEndpoint(
    'POST',
    '/api/contacts',
    {
      firstName: 'John',
      lastName: 'Doe',
      email: `john.doe.${Date.now()}@test.com`, // Unique email
      phone: '+1-555-0100',
      title: 'Software Engineer',
      company: companyId, // Link to company
      status: 'new',
      tags: ['test'],
    },
    'Create a new contact'
  );

  const contactId = createContactResult.success 
    ? createContactResult.data.data._id 
    : null;

  // List contacts
  await testEndpoint('GET', '/api/contacts?page=1&limit=10', null, 'List contacts');

  // Search contacts
  await testEndpoint('GET', '/api/contacts?search=john', null, 'Search contacts');

  // Filter by company
  if (companyId) {
    await testEndpoint(
      'GET',
      `/api/contacts?company=${companyId}`,
      null,
      'Filter contacts by company'
    );
  }

  // Get single contact
  if (contactId) {
    await testEndpoint('GET', `/api/contacts/${contactId}`, null, 'Get contact by ID');

    // Update contact
    await testEndpoint(
      'PUT',
      `/api/contacts/${contactId}`,
      { status: 'contacted' },
      'Update contact status'
    );
  }

  // Bulk import
  await testEndpoint(
    'POST',
    '/api/contacts/import',
    [
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: `jane.smith.${Date.now()}@test.com`,
        title: 'Product Manager',
      },
    ],
    'Bulk import contacts'
  );

  // Tags
  log('\n\n4. TAG ENDPOINTS', 'yellow');
  
  await testEndpoint(
    'POST',
    '/api/tags',
    { name: 'test-tag', color: '#3B82F6' },
    'Create a tag'
  );

  await testEndpoint('GET', '/api/tags', null, 'List all tags');

  // Lists
  log('\n\n5. LIST ENDPOINTS', 'yellow');
  
  const createListResult = await testEndpoint(
    'POST',
    '/api/lists',
    {
      name: 'Test Campaign',
      description: 'A test marketing campaign',
      contacts: contactId ? [contactId] : [],
      companies: companyId ? [companyId] : [],
    },
    'Create a list'
  );

  await testEndpoint('GET', '/api/lists', null, 'List all lists');

  // Cleanup (optional)
  log('\n\n6. CLEANUP', 'yellow');
  
  if (contactId) {
    await testEndpoint('DELETE', `/api/contacts/${contactId}`, null, 'Delete test contact');
  }

  if (companyId) {
    await testEndpoint('DELETE', `/api/companies/${companyId}`, null, 'Delete test company');
  }

  log('\n' + '='.repeat(60), 'cyan');
  log('TESTS COMPLETE', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
}

// Run tests
runTests().catch(error => {
  log(`\nFatal error: ${error.message}`, 'red');
  process.exit(1);
});
