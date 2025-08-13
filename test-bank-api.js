// Simple test to verify the bank balance API endpoint works
const API_URL = 'https://backend.hiddencyber.online/api/spreadsheet/1nUel0oI1j6KAFSuOWAdwj_ywOIXXcNCQ3CFE_DI4i0M/data?sheet=Sheet2';

async function testBankAPI() {
  try {
    console.log('Testing Bank Balance API...');
    console.log('URL:', API_URL);
    
    const response = await fetch(API_URL);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log('\n✅ API Test Successful!');
      console.log('Data structure:', typeof data.data);
      console.log('Number of rows:', Array.isArray(data.data) ? data.data.length : 'Not an array');
      
      if (Array.isArray(data.data) && data.data.length > 0) {
        console.log('First row:', data.data[0]);
        console.log('Headers (if first row):', Array.isArray(data.data[0]) ? data.data[0] : Object.keys(data.data[0]));
      }
    } else {
      console.log('❌ API returned unsuccessful response');
    }
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
  }
}

testBankAPI();