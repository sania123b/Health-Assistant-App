// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Secret key for JWT - In production, use environment variables
const JWT_SECRET = '1844785981282fe6a1719b74bde5a829454e20e25d4026d12eb01fde6f6670e99cab9c80ef5b8f32f2251e3458a42dcc57afe8443bbffdb6bde7026ec644a0bd305d22b79b0cfba676baac6f15bf0a55edb8b3350a3586f5f2d59c3d0cb185b3ee6b0e9c1eef90e735ab68bcfa4638b297d707e2c6cba9b8d78b6fe121159be03f327a8a429edd554e5c2e20169b893c19ab2ff5af859122f49f2874987d9ab8d8767d96f1f5127102198338076fe5aa9ba692db820dd9002a6b588e92c36b4b6853d13e379a7c7c25dafa04032a549af113643a0ac05c11c0f5d7c703e855c40d3dc8aab364ecf1dbf2f4d2fc5660b4373fb57766e0d93417c56f0dbb750ea1';

// API Keys - replace with your actual API keys in production
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';    // Replace with your actual API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCYEXBTjXOA17qb0dP95RH5yquMHk03LMI";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Mock database
const users = [];
const medicalSpecialties = [
  'Allergy & Immunology',
  'Anesthesiology',
  'Cardiology',
  'Dermatology',
  'Emergency Medicine',
  'Endocrinology',
  'Family Medicine',
  'Gastroenterology',
  'General Surgery',
  'Geriatrics',
  'Hematology',
  'Infectious Disease',
  'Internal Medicine',
  'Nephrology',
  'Neurology',
  'Obstetrics & Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedic Surgery',
  'Otolaryngology (ENT)',
  'Pediatrics',
  'Plastic Surgery',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Rheumatology',
  'Urology'
];

const symptoms = [
  { id: 1, name: 'Fever', commonDiseases: ['Common Cold', 'Flu', 'COVID-19', 'Malaria'] },
  { id: 2, name: 'Headache', commonDiseases: ['Migraine', 'Tension Headache', 'Sinusitis', 'Dehydration'] },
  { id: 3, name: 'Cough', commonDiseases: ['Common Cold', 'Bronchitis', 'Pneumonia', 'COVID-19'] },
  { id: 4, name: 'Fatigue', commonDiseases: ['Anemia', 'Depression', 'Chronic Fatigue Syndrome', 'Sleep Apnea'] },
  { id: 5, name: 'Sore Throat', commonDiseases: ['Strep Throat', 'Common Cold', 'Tonsillitis', 'Laryngitis'] },
  { id: 6, name: 'Shortness of Breath', commonDiseases: ['Asthma', 'COVID-19', 'Pneumonia', 'Heart Failure'] },
  { id: 7, name: 'Chest Pain', commonDiseases: ['Heart Attack', 'Angina', 'Heartburn', 'Pulmonary Embolism'] },
  { id: 8, name: 'Nausea', commonDiseases: ['Food Poisoning', 'Gastroenteritis', 'Migraine', 'Pregnancy'] },
  { id: 9, name: 'Abdominal Pain', commonDiseases: ['Appendicitis', 'Gastritis', 'Kidney Stones', 'Irritable Bowel Syndrome'] },
  { id: 10, name: 'Dizziness', commonDiseases: ['Vertigo', 'Low Blood Pressure', 'Anemia', 'Anxiety'] }
];

// Mock disease database with more details
const diseases = {
  'Common Cold': {
    description: 'A viral infection of the upper respiratory tract.',
    symptoms: ['Runny nose', 'Sneezing', 'Congestion', 'Sore throat', 'Cough', 'Mild fever'],
    treatments: ['Rest', 'Stay hydrated', 'Over-the-counter pain relievers', 'Decongestants'],
    specialists: ['General Practitioner', 'Family Medicine']
  },
  'Flu': {
    description: 'A contagious respiratory illness caused by influenza viruses.',
    symptoms: ['Fever', 'Cough', 'Sore throat', 'Body aches', 'Fatigue', 'Headache'],
    treatments: ['Antiviral medications', 'Rest', 'Fluids', 'Pain relievers'],
    specialists: ['General Practitioner', 'Infectious Disease Specialist']
  },
  'COVID-19': {
    description: 'A respiratory disease caused by the SARS-CoV-2 virus.',
    symptoms: ['Fever', 'Cough', 'Shortness of breath', 'Loss of taste or smell', 'Fatigue', 'Body aches'],
    treatments: ['Rest', 'Hydration', 'Over-the-counter pain relievers', 'Prescribed antiviral medications'],
    specialists: ['General Practitioner', 'Infectious Disease Specialist', 'Pulmonologist']
  },
  // Add more diseases as needed
};

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ success: false, message: 'Access denied' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Routes
// User Registration
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  
  // Check if user already exists
  if (users.find(user => user.email === email)) {
    return res.json({ success: false, message: 'Email already registered' });
  }
  
  // In a real app, you would hash the password here
  users.push({ name, email, password });
  
  res.json({ success: true, message: 'Registration successful! Please login.' });
});

// User Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(user => user.email === email && user.password === password);
  
  if (!user) {
    return res.json({ success: false, message: 'Invalid credentials' });
  }
  
  // Generate JWT token
  const token = jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
  
  res.json({ success: true, message: 'Login successful', token });
});

// Get available medical specialties
app.get('/api/specialties', authenticateToken, (req, res) => {
  res.json({
    success: true,
    specialties: medicalSpecialties
  });
});

// Get all symptoms
app.get('/api/symptoms', authenticateToken, (req, res) => {
  res.json({ success: true, symptoms });
});

// Check symptoms
app.post('/api/check-symptoms', authenticateToken, (req, res) => {
  const { selectedSymptoms } = req.body;
  
  if (!selectedSymptoms || !Array.isArray(selectedSymptoms) || selectedSymptoms.length === 0) {
    return res.status(400).json({ success: false, message: 'Please select at least one symptom' });
  }
  
  // Count disease occurrences based on selected symptoms
  const diseaseCount = {};
  
  selectedSymptoms.forEach(symptomId => {
    const symptom = symptoms.find(s => s.id === parseInt(symptomId));
    if (symptom) {
      symptom.commonDiseases.forEach(disease => {
        diseaseCount[disease] = (diseaseCount[disease] || 0) + 1;
      });
    }
  });
  
  // Sort diseases by frequency
  const sortedDiseases = Object.entries(diseaseCount)
    .map(([name, count]) => ({
      name,
      count,
      matchPercentage: Math.round((count / selectedSymptoms.length) * 100),
      ...diseases[name] // Add disease details
    }))
    .sort((a, b) => b.count - a.count);
  
  res.json({
    success: true,
    possibleConditions: sortedDiseases
  });
});

// Get disease details
app.get('/api/disease/:name', authenticateToken, (req, res) => {
  const diseaseName = req.params.name;
  const disease = diseases[diseaseName];
  
  if (!disease) {
    return res.status(404).json({ success: false, message: 'Disease not found' });
  }
  
  res.json({
    success: true,
    disease: {
      name: diseaseName,
      ...disease
    }
  });
});

// Disease research using Gemini AI
app.post('/api/disease-research', authenticateToken, async (req, res) => {
  const { disease } = req.body;
  
  if (!disease) {
    return res.status(400).json({
      success: false,
      message: 'Disease name is required'
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Provide a comprehensive overview of ${disease} including:
    1. Definition and basic explanation
    2. Common symptoms
    3. Causes and risk factors
    4. Diagnosis methods
    5. Treatment options
    6. Prevention strategies
    7. Latest research developments (if available)
    
    Please format the response in clear paragraphs with these headings. Keep it medically accurate but understandable for non-experts.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.json({
      success: true,
      research: text
    });
    
  } catch (error) {
    console.error('Error with Gemini API:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching disease information',
      error: error.message
    });
  }
});

// Find specialists based on location and specialty
app.get('/api/find-specialists', authenticateToken, async (req, res) => {
  const { location, specialty } = req.query;
  
  if (!location || !specialty) {
    return res.status(400).json({
      success: false,
      message: 'Location and specialty are required'
    });
  }
  
  try {
    // First, geocode the location to get coordinates
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const geocodeResponse = await axios.get(geocodeUrl);
    
    if (geocodeResponse.data.status !== 'OK' || !geocodeResponse.data.results[0]) {
      return res.json({
        success: false,
        message: 'Could not find the specified location. Please enter a valid city, state, or ZIP code.'
      });
    }
    
    const { lat, lng } = geocodeResponse.data.results[0].geometry.location;
    const formattedAddress = geocodeResponse.data.results[0].formatted_address;
    const zipCode = extractZipCode(formattedAddress);
    
    // Use NPI Registry API to find healthcare providers
    const npiUrl = `https://npiregistry.cms.hhs.gov/api/?version=2.1&address_purpose=LOCATION&taxonomy_description=${encodeURIComponent(specialty)}&limit=20`;
    
    // Add location to search if we have a ZIP code
    const searchUrl = zipCode ? `${npiUrl}&zip=${zipCode}` : npiUrl;
    
    const npiResponse = await axios.get(searchUrl);
    
    if (npiResponse.data.result_count === 0) {
      throw new Error('No specialists found');
    }
    
    // Map the NPI response to our format
    const specialists = npiResponse.data.results.map(provider => {
      const address = provider.addresses[0] || {};
      
      // Calculate a fake distance since NPI doesn't provide this
      const distance = calculateFakeDistance(lat, lng, address);
      
      return {
        name: `${provider.basic.first_name} ${provider.basic.last_name}${provider.basic.credential ? ', ' + provider.basic.credential : ''}`,
        specialty: provider.taxonomies[0]?.desc || specialty,
        address: formatNpiAddress(address),
        distance: distance,
        phone: address.telephone_number || null,
        website: null, // NPI doesn't include websites
        rating: (Math.random() * 2 + 3).toFixed(1), // Fake rating between 3.0-5.0
        reviewCount: Math.floor(Math.random() * 100) + 5, // Fake review count
        acceptingNewPatients: Math.random() > 0.2 // 80% chance of accepting new patients
      };
    });
    
    // Sort by calculated distance
    specialists.sort((a, b) => a.distance - b.distance);
    
    return res.json({
      success: true,
      specialists
    });
    
  } catch (error) {
    console.error('Error finding specialists:', error);
    
    // Fallback to mock data
    const mockSpecialists = generateMockSpecialists(location, specialty);
    
    return res.json({
      success: true,
      specialists: mockSpecialists,
      note: 'Using demo data. In production with proper API keys, real provider data would be used.'
    });
  }
});

// Helper function to extract ZIP code from formatted address
function extractZipCode(address) {
  // This is a simple regex for US ZIP codes - adjust for your needs
  const zipMatch = address.match(/\b\d{5}(?:-\d{4})?\b/);
  return zipMatch ? zipMatch[0] : null;
}

// Helper function to calculate a "fake" distance based on location data
function calculateFakeDistance(lat, lng, address) {
  // In a real app, you'd use the Google Distance Matrix API or similar
  // For demo purposes, we'll generate a reasonable fake distance
  return parseFloat((Math.random() * 15 + 0.5).toFixed(1));
}

// Helper function to format NPI address
function formatNpiAddress(address) {
  if (!address) return 'Address not available';
  
  const parts = [
    address.address_1,
    address.address_2,
    address.city,
    address.state,
    address.postal_code
  ].filter(Boolean);
  
  return parts.join(', ');
}

// Generate mock specialist data for testing or when API calls fail
function generateMockSpecialists(location, specialty) {
  const cityName = location.split(',')[0].trim();
  
  // Create 5-10 mock specialists
  const count = Math.floor(Math.random() * 6) + 5;
  const mockSpecialists = [];
  
  const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Jennifer', 'Robert', 'Lisa', 'William', 'Maria', 'Priya', 'Raj', 'Aisha', 'Kumar'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Patel', 'Reddy', 'Sharma', 'Gupta'];
  const streetNames = ['Main St', 'Oak Ave', 'Maple Rd', 'Washington Blvd', 'Park Ln', 'Cedar Dr', 'Pine St', 'Elm Rd', 'Hill Road', 'Lake View'];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const streetNumber = Math.floor(Math.random() * 2000) + 100;
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
    
    mockSpecialists.push({
      name: `${firstName} ${lastName}, MD${Math.random() > 0.7 ? ', PhD' : ''}`,
      specialty: specialty,
      address: `${streetNumber} ${streetName}, ${cityName}, ${location.includes(',') ? location.split(',')[1].trim() : 'State'} ${Math.floor(Math.random() * 90000) + 10000}`,
      distance: parseFloat((Math.random() * 15 + 0.5).toFixed(1)),
      phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      website: Math.random() > 0.4 ? `https://dr${lastName.toLowerCase()}.example.com` : null,
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 200) + 5,
      acceptingNewPatients: Math.random() > 0.2 // 80% chance of accepting new patients
    });
  }
  
  return mockSpecialists.sort((a, b) => a.distance - b.distance);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});