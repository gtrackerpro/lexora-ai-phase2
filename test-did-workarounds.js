const axios = require('axios');
require('dotenv').config({ path: './server/.env' });

async function testDIDWorkarounds() {
    console.log('🔧 Testing D-ID API Workarounds...\n');
    
    const apiKey = process.env.D_ID_API_KEY;
    const baseUrl = process.env.D_ID_BASE_URL || 'https://api.d-id.com';
    
    // Test different request formats to work around the circular reference bug
    const testCases = [
        {
            name: 'Minimal Text Request',
            payload: {
                source_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/amy.jpg',
                script: {
                    type: 'text',
                    input: 'Hello',
                    provider: {
                        type: 'elevenlabs',
                        voice_id: 'pNInz6obpgDQGcFmaJgB'
                    }
                }
            }
        },
        {
            name: 'Text with Minimal Config',
            payload: {
                source_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/amy.jpg',
                script: {
                    type: 'text',
                    input: 'Hello',
                    provider: {
                        type: 'elevenlabs',
                        voice_id: 'pNInz6obpgDQGcFmaJgB'
                    }
                },
                config: {
                    result_format: 'mp4'
                }
            }
        },
        {
            name: 'Different Voice Provider',
            payload: {
                source_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/amy.jpg',
                script: {
                    type: 'text',
                    input: 'Hello world',
                    provider: {
                        type: 'microsoft',
                        voice_id: 'en-US-JennyNeural'
                    }
                }
            }
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`🧪 Testing: ${testCase.name}`);
        
        try {
            const response = await axios.post(`${baseUrl}/talks`, testCase.payload, {
                headers: {
                    'Authorization': `Basic ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });
            
            console.log(`✅ ${testCase.name} - SUCCESS`);
            console.log('Talk ID:', response.data.id);
            console.log('Status:', response.data.status);
            console.log('');
            
            // If successful, check status
            setTimeout(async () => {
                try {
                    const statusResponse = await axios.get(`${baseUrl}/talks/${response.data.id}`, {
                        headers: {
                            'Authorization': `Basic ${apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 10000
                    });
                    console.log(`📊 ${testCase.name} Status:`, statusResponse.data.status);
                    if (statusResponse.data.error) {
                        console.log('Error:', statusResponse.data.error);
                    }
                } catch (statusError) {
                    console.log(`❌ ${testCase.name} Status Check Failed:`, statusError.message);
                }
            }, 2000);
            
        } catch (error) {
            console.log(`❌ ${testCase.name} - FAILED`);
            console.log('Status:', error.response?.status);
            console.log('Error:', error.response?.data?.kind || error.message);
            
            if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('circular')) {
                console.log('⚠️  Same circular reference bug detected');
            }
            console.log('');
        }
    }
    
    // Test different HTTP methods and headers
    console.log('🔍 Testing alternative approaches...');
    
    try {
        // Test with different User-Agent
        const userAgentTest = {
            source_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/amy.jpg',
            script: {
                type: 'text',
                input: 'Test',
                provider: {
                    type: 'elevenlabs',
                    voice_id: 'pNInz6obpgDQGcFmaJgB'
                }
            }
        };
        
        const response = await axios.post(`${baseUrl}/talks`, userAgentTest, {
            headers: {
                'Authorization': `Basic ${apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Node.js-Axios-Client'
            },
            timeout: 30000
        });
        
        console.log('✅ User-Agent approach worked');
        console.log('Talk ID:', response.data.id);
        
    } catch (error) {
        console.log('❌ User-Agent approach failed');
        console.log('Error:', error.response?.status, error.response?.data?.kind || error.message);
    }
}

testDIDWorkarounds();
