// tomoro.js - Backend API Calls untuk Tomoro Coffee
const axios = require('axios');

class TomoroAPI {
    constructor() {
        this.baseURL = 'https://api-service.tomoro-coffee.id/portal/app/member';
        this.session = axios.create({
            timeout: 30000,
            headers: {
                'Accept': '*/*',
                'Accept-Language': 'en-ID,id;q=0.9',
                'AppChannel': 'ios',
                'AppLanguage': 'en',
                'Content-Type': 'application/json',
                'CountryCode': 'id',
                'DeviceCode': this.generateDeviceCode(),
                'Origin': 'https://tomoro-register.vercel.app',
                'Referer': 'https://tomoro-register.vercel.app/',
                'Revision': '3.3.0',
                'Timezone': 'Asia/Jakarta',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
            }
        });
    }

    generateDeviceCode() {
        const parts = [];
        for (let i = 0; i < 5; i++) {
            let part = '';
            for (let j = 0; j < 4; j++) {
                part += '0123456789abcdef'[Math.floor(Math.random() * 16)];
            }
            parts.push(part);
        }
        return parts.join('-');
    }

    async sendOTP(phoneNumber, method) {
        const url = `${this.baseURL}/sendMessage`;
        const params = {
            areaCode: '62',
            phone: phoneNumber,
            verifyChannel: method
        };

        try {
            console.log(`📱 Sending OTP to +62${phoneNumber} via ${method}...`);
            const response = await this.session.get(url, { params });
            
            if (response.data.code === 200) {
                return { success: true, message: 'OTP sent successfully' };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async verifyOTP(phoneNumber, smsCode) {
        const url = `${this.baseURL}/v2/verifySms`;
        const payload = {
            areaCode: '62',
            phone: phoneNumber,
            smsCode: smsCode
        };

        try {
            const response = await this.session.post(url, payload);
            return response.data;
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async register(phoneNumber, smsCode, name, email, password) {
        const url = `${this.baseURL}/v2/register`;
        const payload = {
            areaCode: '62',
            phone: phoneNumber,
            smsCode: smsCode,
            name: name,
            email: email,
            password: password,
            referralCode: '36F0VY',
            agreement: true
        };

        try {
            const response = await this.session.post(url, payload);
            return response.data;
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async login(phoneNumber, password) {
        const url = `${this.baseURL}/v2/login`;
        const payload = {
            areaCode: '62',
            phone: phoneNumber,
            password: password
        };

        try {
            const response = await this.session.post(url, payload);
            if (response.data.code === 200) {
                return { success: true, data: response.data.data };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async checkVouchers(token) {
        const url = `${this.baseURL}/coupon/list`;
        
        try {
            const response = await this.session.get(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.data.code === 200) {
                return { success: true, vouchers: response.data.data || [] };
            }
            return { success: false, vouchers: [] };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

// Export untuk digunakan di frontend
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TomoroAPI;
}

// Untuk penggunaan langsung di Node.js
if (require.main === module) {
    const bot = new TomoroAPI();
    
    async function testRegistration() {
        console.log('🚀 Testing Tomoro Registration...');
        
        // Test send OTP
        const otpResult = await bot.sendOTP('81234567890', 'WHATSAPP');
        console.log('OTP Result:', otpResult);
    }
    
    testRegistration();
}
