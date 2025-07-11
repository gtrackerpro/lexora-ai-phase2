const axios = require('axios');
require('dotenv').config({ path: './server/.env' });

async function testDIDAPI() {
    console.log('🧪 Testing D-ID API Configuration...\n');
    
    const apiKey = process.env.D_ID_API_KEY;
    const baseUrl = process.env.D_ID_BASE_URL || 'https://api.d-id.com';
    
    console.log('API Key configured:', apiKey ? 'Yes' : 'No');
    console.log('API Key format:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not configured');
    console.log('Base URL:', baseUrl);
    console.log('');
    
    try {
        // Test 1: Check API connectivity with credits endpoint
        console.log('📊 Testing D-ID API connectivity...');
        const creditsResponse = await axios.get(`${baseUrl}/credits`, {
            headers: {
                'Authorization': `Basic ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ D-ID API connectivity test passed');
        console.log('Credits info:', creditsResponse.data);
        console.log('');
        
        // Test 2: Check available voices
        console.log('🎤 Testing D-ID voices endpoint...');
        try {
            const voicesResponse = await axios.get(`${baseUrl}/voices`, {
                headers: {
                    'Authorization': `Basic ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            console.log('✅ D-ID voices endpoint accessible');
            console.log('Available voices:', voicesResponse.data.length || 'Unknown count');
        } catch (voicesError) {
            console.log('⚠️  D-ID voices endpoint not available or requires different auth');
        }
        console.log('');
        
        // Test 3: Simple text-to-video test
        console.log('🎬 Testing D-ID talk creation with simple text...');
        const simpleTestPayload = {
            source_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/amy.jpg',
            script: {
                type: 'text',
                input: 'Hello, this is a test.',
                provider: {
                    type: 'elevenlabs',
                    voice_id: 'pNInz6obpgDQGcFmaJgB'
                }
            }
        };
        
        const testResponse = await axios.post(`${baseUrl}/talks`, simpleTestPayload, {
            headers: {
                'Authorization': `Basic ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        
        console.log('✅ D-ID simple test talk created successfully');
        console.log('Talk ID:', testResponse.data.id);
        console.log('Status:', testResponse.data.status);
        console.log('');
        
        // Test 4: Check the test talk status
        console.log('🔍 Checking test talk status...');
        const statusResponse = await axios.get(`${baseUrl}/talks/${testResponse.data.id}`, {
            headers: {
                'Authorization': `Basic ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ Test talk status retrieved');
        console.log('Status:', statusResponse.data.status);
        if (statusResponse.data.error) {
            console.log('Error details:', statusResponse.data.error);
        }
        
    } catch (error) {
        console.error('❌ D-ID API Test Error:');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Error Data:', error.response?.data);
        console.error('Error Message:', error.message);
        
        if (error.response?.status === 401) {
            console.log('\n🔑 Authentication Issue Detected:');
            console.log('- Check if the D-ID API key is correct');
            console.log('- Ensure the API key format is: email:api_key');
            console.log('- Verify the API key is properly base64 encoded');
        } else if (error.response?.status === 402) {
            console.log('\n💳 Payment Issue Detected:');
            console.log('- Check D-ID account balance');
            console.log('- Verify payment method is active');
        } else if (error.response?.status === 500) {
            console.log('\n🚨 Server Error Detected:');
            console.log('- D-ID API might be experiencing issues');
            console.log('- Try again later or contact D-ID support');
        }
    }
}

// Function to validate API key format
function validateAPIKeyFormat(apiKey) {
    console.log('🔍 Validating API Key Format...');
    
    if (!apiKey) {
        console.log('❌ No API key provided');
        return false;
    }
    
    // Check if it looks like email:token format
    if (apiKey.includes(':')) {
        const parts = apiKey.split(':');
        if (parts.length === 2 && parts[0].includes('@') && parts[1].length > 10) {
            console.log('✅ API key appears to be in email:token format');
            return true;
        }
    }
    
    // Check if it's base64 encoded
    try {
        const decoded = Buffer.from(apiKey, 'base64').toString('utf-8');
        if (decoded.includes(':') && decoded.includes('@')) {
            console.log('✅ API key appears to be base64 encoded email:token format');
            return true;
        }
    } catch (e) {
        // Not base64
    }
    
    console.log('⚠️  API key format might be incorrect');
    console.log('Expected format: email:api_key or base64(email:api_key)');
    return false;
}

// Run the validation first
validateAPIKeyFormat(process.env.D_ID_API_KEY);
console.log('');

// Then run the API test
testDIDAPI();
