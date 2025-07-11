const axios = require('axios');

async function testAPIs() {
    console.log('🧪 Testing API Configuration...\n');
    
    try {
        // Test configuration status
        const configResponse = await axios.get('http://localhost:5000/api/config/status');
        console.log('✅ Configuration Status:', configResponse.data);
        
        // Test health endpoint
        const healthResponse = await axios.get('http://localhost:5000/api/health');
        console.log('✅ Health Status:', healthResponse.data);
        
        // Test D-ID health (if available)
        try {
            const didHealthResponse = await axios.get('http://localhost:5000/api/videos/did/health');
            console.log('✅ D-ID Health:', didHealthResponse.data);
        } catch (error) {
            console.log('⚠️  D-ID Health check failed (expected in dev mode)');
        }
        
        console.log('\n🎉 All API tests completed successfully!');
        
    } catch (error) {
        console.error('❌ API Test Error:', error.response?.data || error.message);
    }
}

testAPIs();
