const VONAGE_API_KEY = '44da89d7'
const VONAGE_API_SECRET = 'mfHuxlPpsTW8rBF1'
const VONAGE_FROM = 'TS Attend'

let otpStorage = {}

export async function sendVonageOTP(phoneNumber) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  
  console.log(`OTP for ${phoneNumber}: ${otp}`)
  
  const message = `Your TS Attend verification code is: ${otp}`
  
  const params = new URLSearchParams({
    api_key: VONAGE_API_KEY,
    api_secret: VONAGE_API_SECRET,
    from: VONAGE_FROM,
    to: phoneNumber.replace('+', ''),
    text: message
  })

  try {
    fetch('https://api.nexmo.com/sms/json', {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })
  } catch (error) {
    console.log('SMS API blocked by CORS - using local OTP')
  }

  otpStorage[phoneNumber] = {
    otp: otp,
    time: Date.now()
  }
  
  return { success: true }
}

export function verifyVonageOTP(otp, phoneNumber) {
  const stored = otpStorage[phoneNumber]
  
  const now = Date.now()
  const expiryTime = 10 * 60 * 1000
  
  if (!stored) {
    return { valid: false, error: 'No OTP found. Please request a new OTP.' }
  }
  
  if (now - stored.time > expiryTime) {
    delete otpStorage[phoneNumber]
    return { valid: false, error: 'OTP expired. Please request a new OTP.' }
  }
  
  if (otp !== stored.otp) {
    return { valid: false, error: 'Invalid OTP' }
  }
  
  delete otpStorage[phoneNumber]
  
  return { valid: true }
}