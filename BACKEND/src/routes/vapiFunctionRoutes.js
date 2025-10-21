import express from 'express';
import User from '../models/User.js';
import DoctorDetails from '../models/DoctorDetails.js';
import Appointment from '../models/Appointment.js';
import { generateSlotsForDate } from '../utils/slots.js';
import { sendEmail } from '../utils/mail.js';
import { format, startOfDay, endOfDay } from 'date-fns';
import { zonedTimeToUtc, formatInTimeZone } from 'date-fns-tz';

const router = express.Router();
const PKT = 'Asia/Karachi';

// Individual endpoints for each function (Vapi calls these directly)
router.post('/functions/searchDoctors', async (req, res) => {
  try {
    console.log('📞 Search Doctors Request:', JSON.stringify(req.body, null, 2));
    const result = await handleSearchDoctors(req.body);
    console.log('✅ Search Result:', result);
    return res.json(result);
  } catch (error) {
    console.error('❌ Search error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error searching for doctors. Please try again.'
    });
  }
});

router.post('/functions/getDoctorSlots', async (req, res) => {
  try {
    console.log('📞 Get Slots Request:', JSON.stringify(req.body, null, 2));
    const result = await handleGetDoctorSlots(req.body);
    console.log('✅ Slots Result:', result);
    return res.json(result);
  } catch (error) {
    console.error('❌ Slots error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error getting available slots. Please try again.'
    });
  }
});

// router.post('/functions/bookAppointment', async (req, res) => {
//   try {
//     console.log('📞 Book Appointment Request:', JSON.stringify(req.body, null, 2));
//     const result = await handleBookAppointment(req.body);
//     console.log('✅ Booking Result:', result);
//     return res.json(result);
//   } catch (error) {
//     console.error('❌ Booking error:', error);
//     return res.status(500).json({ 
//       success: false,
//       message: 'Error booking appointment. Please try again.'
//     });
//   }
// });
// 🔧 IMPROVED: Vapi-compatible route handler
router.post('/functions/bookAppointment', async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('🟦 =================== VAPI BOOKING REQUEST ===================');
    console.log('⏱️  Timestamp:', new Date().toISOString());
    console.log('📨 Headers:', JSON.stringify({
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      'origin': req.headers['origin']
    }, null, 2));
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
    
    // Validate body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error('❌ Empty request body!');
      return res.status(200).json({
        success: false,
        message: 'No booking information received. Please try again.'
      });
    }
    
    // Check for required fields
    const requiredFields = ['doctorId', 'patientName', 'patientEmail', 'appointmentDate', 'appointmentSlot'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return res.status(200).json({
        success: false,
        message: `Missing required information: ${missingFields.join(', ')}. Please provide all details.`
      });
    }
    
    // Call the booking handler
    const result = await handleBookAppointment(req.body);
    
    const duration = Date.now() - startTime;
    console.log('🟩 =================== BOOKING RESPONSE ===================');
    console.log('⏱️  Duration:', duration, 'ms');
    console.log('✅ Success:', result.success);
    console.log('📋 Result:', JSON.stringify(result, null, 2));
    console.log('🟩 =========================================================');
    
    // ⚠️ CRITICAL: Always return 200 OK to Vapi
    // Vapi determines success/failure from the 'success' field in the response body
    return res.status(200).json(result);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error('🟥 =================== BOOKING ERROR ===================');
    console.error('⏱️  Duration:', duration, 'ms');
    console.error('❌ Error Type:', error.name);
    console.error('❌ Error Message:', error.message);
    console.error('❌ Error Stack:', error.stack);
    console.error('🟥 =======================================================');
    
    // ⚠️ Still return 200 OK with structured error response
    return res.status(200).json({ 
      success: false,
      message: 'Sorry, there was a technical issue booking your appointment. Please try again or contact support.'
    });
  }
});

// ============================================
// Function 1: Search Doctors (matches browseDoctors logic)
// ============================================
async function handleSearchDoctors(params) {
  const { specialization, city } = params;

  console.log(`🔍 Searching: ${specialization} in ${city || 'all cities'}`);

  const detailsQuery = {};
  
  // Handle specialization variations (dermatology -> dermatologist, cardiology -> cardiologist)
  if (specialization) {
    const searchTerm = specialization.toLowerCase();
    // Create a more flexible regex that matches partial words
    // This will match: dermatology, dermatologist, derma, etc.
    const baseWord = searchTerm.replace(/(ology|ologist|ist)$/i, '');
    detailsQuery.specialization = new RegExp(baseWord, 'i');
    console.log(`🔎 Search term: "${searchTerm}" -> Base word: "${baseWord}"`);
  }

  console.log('🔍 Searching with query:', detailsQuery);

  // Find matching doctor details (ignoring city since it's not in your schema)
  let details = await DoctorDetails.find(detailsQuery).limit(10);
  console.log(`📊 Found ${details.length} doctor details`);
  
  // Always populate cityId to get city name
  if (details.length > 0) {
    details = await DoctorDetails.find(detailsQuery)
      .populate('cityId', 'name')
      .limit(10);
  }
  
  // If city is specified, filter by city name
  if (city && details.length > 0) {
    const cityLower = city.toLowerCase();
    details = details.filter(d => 
      d.cityId?.name?.toLowerCase().includes(cityLower)
    );
    console.log(`📍 Filtered to ${details.length} doctors in ${city}`);
  }
  
  const doctors = await Promise.all(details.map(async (d) => {
    const user = await User.findById(d.userId).select('-password');
    return { 
      user, 
      details: d 
    };
  }));

  if (doctors.length === 0) {
    return {
      success: false,
      count: 0,
      doctors: [],
      message: `No doctors found for ${specialization}${city ? ' in ' + city : ''}. Please try a different specialization or city.`
    };
  }

  // Format for voice
  const doctorsList = doctors.map((d, idx) => {
    const doc = d.details;
    const name = d.user.name;
    const cityName = doc.cityId?.name || 'location not specified';
    return `${idx + 1}. Dr. ${name}, ${doc.experience || 0} years experience, Fee: ${doc.consultationFee || 'N/A'} PKR, ${cityName}`;
  }).join('. ');

  return {
    success: true,
    count: doctors.length,
    doctors: doctors.map(d => ({
      id: d.user._id.toString(),
      name: d.user.name,
      specialization: d.details.specialization,
      city: d.details.cityId?.name || null,
      fee: d.details.consultationFee,
      experience: d.details.experience
    })),
    message: `I found ${doctors.length} ${specialization} doctor${doctors.length > 1 ? 's' : ''}${city ? ' in ' + city : ''}: ${doctorsList}. Which doctor would you like to book?`
  };
}

// ============================================
// Function 2: Get Doctor Slots (matches getDoctorSlots logic)
// ============================================
async function handleGetDoctorSlots(params) {
  const { doctorId, date } = params;

  console.log(`📅 Getting slots for doctor ${doctorId} on ${date}`);

  // Verify doctor exists
  const doctorUser = await User.findById(doctorId);
  if (!doctorUser) {
    return {
      success: false,
      available: false,
      message: 'Doctor not found. Please select a valid doctor.'
    };
  }

  // Keep targetDate in PKT
  const targetDate = new Date(`${date}T00:00:00+05:00`);

  const doctorDetails = await DoctorDetails.findOne({ userId: doctorId });
  if (!doctorDetails || !doctorDetails.availability) {
    return {
      success: false,
      available: false,
      message: `Dr. ${doctorUser.name} doesn't have availability configured. Please try another doctor.`
    };
  }

  console.log(`📋 Doctor availability:`, doctorDetails.availability);

  // Get day name
  const dayName = format(targetDate, 'EEEE');
  console.log(`📆 Looking for availability on: ${dayName}`);
  
  // Check if doctor works on this day - using correct field names
  const dayAvailability = doctorDetails.availability.filter(
    av => av && av.dayOfWeek && av.dayOfWeek.toLowerCase() === dayName.toLowerCase()
  );

  console.log(`✅ Day availability slots:`, dayAvailability);

  if (!dayAvailability || dayAvailability.length === 0) {
    return {
      success: false,
      available: false,
      message: `Dr. ${doctorUser.name} is not available on ${dayName}s. Please choose a different date.`
    };
  }

  // Generate slots from all availability periods for this day
  const allSlots = [];
  for (const avail of dayAvailability) {
    const slots = generateSlotsFromTime(avail.startTime, avail.endTime);
    allSlots.push(...slots);
  }

  console.log(`🕐 Generated ${allSlots.length} slots:`, allSlots);

  // 2. Compute PKT day boundaries, convert to UTC for DB query
  const pktStart = startOfDay(targetDate);
  const pktEnd = endOfDay(targetDate);
  const dayStartUtc = zonedTimeToUtc(pktStart, PKT);
  const dayEndUtc = zonedTimeToUtc(pktEnd, PKT);

  // 3. Find booked appointments in UTC range
  const appts = await Appointment.find({
    doctorId: doctorId,
    startTime: { $gte: dayStartUtc, $lte: dayEndUtc },
    status: { $ne: 'cancelled' }
  });

  // 4. Map booked slots into PKT
  const bookedSet = new Set(
    appts.map(a => formatInTimeZone(a.startTime, PKT, 'HH:mm'))
  );

  // 5. Remove booked slots
  const freeSlots = allSlots.filter(s => !bookedSet.has(s));

  if (freeSlots.length === 0) {
    return {
      success: false,
      available: false,
      message: `Dr. ${doctorUser.name} has no available slots on ${date}. Please try a different date.`
    };
  }

  // Convert slots to readable format (e.g., "09:00" -> "9:00 AM - 9:30 AM")
  const formattedSlots = freeSlots.map(slot => {
    const [hours, minutes] = slot.split(':');
    const hour = parseInt(hours);
    const nextHour = hour;
    const nextMinute = parseInt(minutes) + 30;
    
    const formatTime = (h, m) => {
      const adjustedH = m >= 60 ? h + 1 : h;
      const adjustedM = m >= 60 ? m - 60 : m;
      const period = adjustedH >= 12 ? 'PM' : 'AM';
      const displayH = adjustedH > 12 ? adjustedH - 12 : adjustedH === 0 ? 12 : adjustedH;
      return `${displayH}:${adjustedM.toString().padStart(2, '0')} ${period}`;
    };

    return `${formatTime(hour, parseInt(minutes))} - ${formatTime(nextHour, nextMinute)}`;
  });

  return {
    success: true,
    available: true,
    date,
    doctorName: doctorUser.name,
    slots: formattedSlots,
    message: `Dr. ${doctorUser.name} is available on ${format(targetDate, 'EEEE, MMMM do')} at: ${formattedSlots.slice(0, 5).join(', ')}${formattedSlots.length > 5 ? `, and ${formattedSlots.length - 5} more` : ''}. Which time works for you?`
  };
}

// ============================================
// Function 3: Book Appointment (matches voiceBookingWebhook logic)
// ============================================
// async function handleBookAppointment(params) {
//   const {
//     doctorId,
//     doctorName,
//     patientName,
//     patientEmail,
//     patientPhone,
//     appointmentDate,
//     appointmentSlot,
//     symptoms,
//     consultationFee
//   } = params;

//   console.log(`📝 Booking for ${patientName} with doctor ${doctorId}`);

//   // Validation
//   if (!doctorId || !patientName || !patientEmail || !appointmentDate || !appointmentSlot) {
//     return {
//       success: false,
//       message: 'Missing required information. Please provide all details.'
//     };
//   }

//   // Validate email format
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(patientEmail)) {
//     return {
//       success: false,
//       message: 'Invalid email address. Please provide a valid email.'
//     };
//   }

//   // Validate phone format (Pakistani format) - optional field
//   if (patientPhone) {
//     const cleanPhone = patientPhone.replace(/[\s\-\(\)]/g, '');
//     // Accept: +923XXXXXXXXX (13 digits), 03XXXXXXXXX (11 digits), or 3XXXXXXXXX (10 digits)
//     if (!/^(\+92|0)?3\d{9}$/.test(cleanPhone)) {
//       console.log('❌ Invalid phone format:', patientPhone, 'cleaned:', cleanPhone);
//       return {
//         success: false,
//         message: 'Invalid phone number format. Please use Pakistani format (e.g., 03XXXXXXXXX).'
//       };
//     }
//   }

//   // Parse appointment slot (e.g., "10:30 AM - 11:00 AM" or just "10:30 AM")
//   let startTimeStr, endTimeStr;
  
//   if (appointmentSlot.includes(' - ')) {
//     // Format: "10:30 AM - 11:00 AM"
//     [startTimeStr, endTimeStr] = appointmentSlot.split(' - ');
//   } else {
//     // Format: "10:30 AM" - assume 30-minute appointment
//     startTimeStr = appointmentSlot.trim();
//     // Calculate end time (30 minutes later)
//     const [time, modifier] = startTimeStr.split(' ');
//     const [hours, minutes] = time.split(':');
//     let endHour = parseInt(hours);
//     let endMinute = parseInt(minutes) + 30;
    
//     if (endMinute >= 60) {
//       endHour += 1;
//       endMinute -= 60;
//     }
    
//     // Handle 12-hour format for end time
//     let endModifier = modifier;
//     if (endHour === 12 && endMinute === 0) {
//       endModifier = modifier === 'AM' ? 'PM' : 'AM';
//     } else if (endHour > 12) {
//       endHour -= 12;
//       endModifier = 'PM';
//     }
    
//     endTimeStr = `${endHour}:${endMinute.toString().padStart(2, '0')} ${endModifier}`;
//     console.log(`📅 Converted slot "${appointmentSlot}" to "${startTimeStr} - ${endTimeStr}"`);
//   }
  
//   if (!startTimeStr || !endTimeStr) {
//     return {
//       success: false,
//       message: 'Invalid time slot format.'
//     };
//   }

//   // Create times in PKT
//   const startTime = new Date(`${appointmentDate}T${convertTo24Hour(startTimeStr)}:00+05:00`);
//   const endTime = new Date(`${appointmentDate}T${convertTo24Hour(endTimeStr)}:00+05:00`);

//   // Check if slot is still available
//   const existingAppointment = await Appointment.findOne({
//     doctorId,
//     startTime: zonedTimeToUtc(startTime, PKT),
//     status: { $ne: 'cancelled' }
//   });

//   if (existingAppointment) {
//     return {
//       success: false,
//       message: 'This time slot was just booked by someone else. Please choose another time.'
//     };
//   }

//   // Verify doctor exists
//   const doctorUser = await User.findById(doctorId);
//   if (!doctorUser) {
//     return {
//       success: false,
//       message: 'Doctor not found.'
//     };
//   }

//   try {
//     // Create appointment - matches your voiceBookingWebhook structure
//     const appointmentDoc = {
//       doctorId,
//       patientEmail,
//       startTime: zonedTimeToUtc(startTime, PKT), // Store as UTC
//       endTime: zonedTimeToUtc(endTime, PKT),     // Store as UTC
//       status: 'booked',
//       symptoms: symptoms || 'Voice booking',
//       consultationFee: consultationFee || 0,
//       notes: `Voice booking for ${patientName}. Phone: ${patientPhone || 'Not provided'}`,
//       bookingMethod: 'voice'
//     };

//     const appointment = await Appointment.create(appointmentDoc);

//     console.log(`✅ Appointment created: ${appointment._id}`);

//     // Send confirmation email (async, don't block response)
//     (async () => {
//       try {
//         await sendEmail({
//           to: patientEmail,
//           subject: 'Voice Appointment Confirmation - Dr. ' + doctorUser.name,
//           html: `
//             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//               <h2 style="color: #4CAF50; text-align: center;">Voice Appointment Confirmed!</h2>
              
//               <p>Dear ${patientName},</p>
//               <p>Your appointment booked via voice has been successfully confirmed!</p>
              
//               <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
//                 <h3 style="color: #333; margin-top: 0;">Appointment Details:</h3>
//                 <p><strong>Doctor:</strong> Dr. ${doctorUser.name}</p>
//                 <p><strong>Date:</strong> ${formatInTimeZone(zonedTimeToUtc(startTime, PKT), PKT, "EEEE, MMMM do, yyyy")}</p>
//                 <p><strong>Time:</strong> ${appointmentSlot}</p>
//                 <p><strong>Contact:</strong> ${patientPhone || 'Not provided'}</p>
//                 <p><strong>Symptoms:</strong> ${symptoms || 'Voice booking'}</p>
//                 ${consultationFee ? `<p><strong>Fee:</strong> PKR ${consultationFee}</p>` : ''}
//               </div>
              
//               <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
//                 <h4 style="color: #1976d2; margin-top: 0;">Important Notes:</h4>
//                 <ul style="color: #333;">
//                   <li>Please arrive 15 minutes before your scheduled appointment</li>
//                   <li>Bring a valid ID and any relevant medical documents</li>
//                   <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
//                 </ul>
//               </div>
              
//               <p style="text-align: center; margin-top: 30px;">
//                 <strong>Thank you for using our voice booking system!</strong><br>
//                 <span style="color: #666;">Healthcare Appointment System</span>
//               </p>
//             </div>
//           `
//         });
//       } catch (emailError) {
//         console.error('Failed to send confirmation email:', emailError);
//         // Don't fail the booking if email fails
//       }
//     })();

//     // Format date for confirmation
//     const formattedDate = format(new Date(appointmentDate), 'EEEE, MMMM do, yyyy');

//     return {
//       success: true,
//       appointmentId: appointment._id.toString(),
//       message: `Perfect! Your appointment is confirmed with Dr. ${doctorUser.name} on ${formattedDate} at ${appointmentSlot}. The consultation fee is ${consultationFee || 'to be confirmed'} PKR. A confirmation email has been sent to ${patientEmail}. Is there anything else I can help you with?`
//     };

//   } catch (error) {
//     console.error('Booking error:', error);
    
//     if (error.code === 11000) {
//       return {
//         success: false,
//         message: 'This time slot is already booked. Please choose another time.'
//       };
//     }

//     return {
//       success: false,
//       message: 'There was an error booking your appointment. Please try again.'
//     };
//   }
// }

/**
 * Helper function to convert 12-hour format to 24-hour format
 * Matches the function in patientController.js
 */
// function convertTo24Hour(time12h) {
//   const [time, modifier] = time12h.trim().split(' ');
//   let [hours, minutes] = time.split(':');
  
//   if (hours === '12') {
//     hours = '00';
//   }
  
//   if (modifier === 'PM') {
//     hours = parseInt(hours, 10) + 12;
//   }
  
//   return `${hours.toString().padStart(2, '0')}:${minutes}`;
// }
// ============================================
// Fixed Book Appointment Function
// ============================================

// async function handleBookAppointment(params) {
//   const {
//     doctorId,
//     doctorName,
//     patientName,
//     patientEmail,
//     patientPhone,
//     appointmentDate,
//     appointmentSlot,
//     symptoms,
//     consultationFee
//   } = params;

//   console.log('📝 Booking Parameters:', {
//     doctorId,
//     patientName,
//     patientEmail,
//     patientPhone,
//     appointmentDate,
//     appointmentSlot,
//     symptoms,
//     consultationFee
//   });

//   // Validation
//   if (!doctorId || !patientName || !patientEmail || !appointmentDate || !appointmentSlot) {
//     console.log('❌ Missing required fields');
//     return {
//       success: false,
//       message: 'Missing required information. Please provide all details.'
//     };
//   }

//   // Validate email format
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(patientEmail)) {
//     console.log('❌ Invalid email:', patientEmail);
//     return {
//       success: false,
//       message: 'Invalid email address. Please provide a valid email.'
//     };
//   }

//   // Relaxed phone validation (optional field)
//   if (patientPhone) {
//     const cleanPhone = patientPhone.replace(/[\s\-\(\)]/g, '');
//     console.log('📱 Validating phone:', patientPhone, '-> cleaned:', cleanPhone);
    
//     // Accept various Pakistani formats:
//     // +923001234567, 03001234567, 3001234567
//     if (!/^(\+?92)?0?3\d{9}$/.test(cleanPhone)) {
//       console.log('❌ Invalid phone format');
//       return {
//         success: false,
//         message: 'Invalid phone number. Please provide a valid Pakistani mobile number.'
//       };
//     }
//   }

//   // Parse appointment slot with better error handling
//   let startTimeStr, endTimeStr;
  
//   try {
//     const trimmedSlot = appointmentSlot.trim();
//     console.log('🕐 Parsing slot:', trimmedSlot);
    
//     if (trimmedSlot.includes(' - ')) {
//       // Format: "10:30 AM - 11:00 AM"
//       [startTimeStr, endTimeStr] = trimmedSlot.split(' - ').map(s => s.trim());
//     } else if (trimmedSlot.includes('-')) {
//       // Format without spaces: "10:30AM-11:00AM"
//       [startTimeStr, endTimeStr] = trimmedSlot.split('-').map(s => s.trim());
//     } else {
//       // Single time - calculate end time (30 min later)
//       startTimeStr = trimmedSlot;
//       endTimeStr = calculateEndTime(startTimeStr);
//     }
    
//     console.log('⏰ Parsed times:', { startTimeStr, endTimeStr });
    
//     if (!startTimeStr || !endTimeStr) {
//       throw new Error('Could not parse time slot');
//     }
//   } catch (error) {
//     console.error('❌ Slot parsing error:', error);
//     return {
//       success: false,
//       message: 'Invalid time slot format. Please provide time in format like "10:30 AM" or "10:30 AM - 11:00 AM"'
//     };
//   }

//   // Convert to 24-hour format and create Date objects
//   try {
//     const start24 = convertTo24Hour(startTimeStr);
//     const end24 = convertTo24Hour(endTimeStr);
    
//     console.log('🔄 Converted to 24h:', { start24, end24 });
    
//     // Ensure date is in YYYY-MM-DD format
//     const dateStr = appointmentDate.includes('T') 
//       ? appointmentDate.split('T')[0] 
//       : appointmentDate;
    
//     // Create Date objects with PKT timezone
//     const startTime = new Date(`${dateStr}T${start24}:00+05:00`);
//     const endTime = new Date(`${dateStr}T${end24}:00+05:00`);
    
//     console.log('📅 Created dates:', {
//       startTime: startTime.toISOString(),
//       endTime: endTime.toISOString()
//     });
    
//     // Validate dates
//     if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
//       throw new Error('Invalid date created');
//     }
    
//     // Check if slot is still available
//     const startTimeUtc = zonedTimeToUtc(startTime, PKT);
    
//     const existingAppointment = await Appointment.findOne({
//       doctorId,
//       startTime: startTimeUtc,
//       status: { $ne: 'cancelled' }
//     });

//     if (existingAppointment) {
//       console.log('❌ Slot already booked');
//       return {
//         success: false,
//         message: 'This time slot was just booked by someone else. Please choose another time.'
//       };
//     }

//     // Verify doctor exists
//     const doctorUser = await User.findById(doctorId);
//     if (!doctorUser) {
//       console.log('❌ Doctor not found');
//       return {
//         success: false,
//         message: 'Doctor not found.'
//       };
//     }

//     // Create appointment
//     const appointmentDoc = {
//       doctorId,
//       patientEmail,
//       pa
//       startTime: zonedTimeToUtc(startTime, PKT),
//       endTime: zonedTimeToUtc(endTime, PKT),
//       status: 'booked',
//       symptoms: symptoms || 'Voice booking',
//       consultationFee: consultationFee || 0,
//       notes: `Voice booking for ${patientName}. Phone: ${patientPhone || 'Not provided'}`,
//       bookingMethod: 'voice'
//     };

//     console.log('💾 Creating appointment:', appointmentDoc);
    
//     const appointment = await Appointment.create(appointmentDoc);

//     console.log(`✅ Appointment created: ${appointment._id}`);

//     // Send confirmation email (async, don't block response)
//     setImmediate(async () => {
//       try {
//         await sendEmail({
//           to: patientEmail,
//           subject: 'Voice Appointment Confirmation - Dr. ' + doctorUser.name,
//           html: `
//             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//               <h2 style="color: #4CAF50; text-align: center;">Voice Appointment Confirmed!</h2>
              
//               <p>Dear ${patientName},</p>
//               <p>Your appointment has been successfully confirmed!</p>
              
//               <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
//                 <h3 style="color: #333; margin-top: 0;">Appointment Details:</h3>
//                 <p><strong>Doctor:</strong> Dr. ${doctorUser.name}</p>
//                 <p><strong>Date:</strong> ${formatInTimeZone(startTimeUtc, PKT, "EEEE, MMMM do, yyyy")}</p>
//                 <p><strong>Time:</strong> ${appointmentSlot}</p>
//                 <p><strong>Contact:</strong> ${patientPhone || 'Not provided'}</p>
//                 <p><strong>Symptoms:</strong> ${symptoms || 'Voice booking'}</p>
//                 ${consultationFee ? `<p><strong>Fee:</strong> PKR ${consultationFee}</p>` : ''}
//               </div>
              
//               <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
//                 <h4 style="color: #1976d2; margin-top: 0;">Important Notes:</h4>
//                 <ul style="color: #333;">
//                   <li>Please arrive 15 minutes before your scheduled appointment</li>
//                   <li>Bring a valid ID and any relevant medical documents</li>
//                   <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
//                 </ul>
//               </div>
              
//               <p style="text-align: center; margin-top: 30px;">
//                 <strong>Thank you for using our voice booking system!</strong><br>
//                 <span style="color: #666;">Healthcare Appointment System</span>
//               </p>
//             </div>
//           `
//         });
//         console.log('✅ Email sent successfully');
//       } catch (emailError) {
//         console.error('❌ Failed to send confirmation email:', emailError);
//       }
//     });

//     // Format date for confirmation message
//     const formattedDate = format(startTime, 'EEEE, MMMM do, yyyy');

//     return {
//       success: true,
//       appointmentId: appointment._id.toString(),
//       message: `Perfect! Your appointment is confirmed with Dr. ${doctorUser.name} on ${formattedDate} at ${appointmentSlot}. The consultation fee is ${consultationFee || 'to be confirmed'} PKR. A confirmation email has been sent to ${patientEmail}. Is there anything else I can help you with?`
//     };

//   } catch (error) {
//     console.error('❌ Booking error:', error);
    
//     if (error.code === 11000) {
//       return {
//         success: false,
//         message: 'This time slot is already booked. Please choose another time.'
//       };
//     }

//     return {
//       success: false,
//       message: `There was an error booking your appointment: ${error.message}. Please try again.`
//     };
//   }
// }
async function handleBookAppointment(params) {
  const {
    doctorId,
    doctorName,
    patientName,
    patientEmail,
    patientPhone,
    appointmentDate,
    appointmentSlot,
    symptoms,
    consultationFee
  } = params;

  console.log('📝 Booking Parameters:', {
    doctorId,
    patientName,
    patientEmail,
    patientPhone,
    appointmentDate,
    appointmentSlot,
    symptoms,
    consultationFee
  });

  // Validation
  if (!doctorId || !patientName || !patientEmail || !appointmentDate || !appointmentSlot) {
    console.log('❌ Missing required fields');
    return {
      success: false,
      message: 'Missing required information. Please provide all details.'
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(patientEmail)) {
    console.log('❌ Invalid email:', patientEmail);
    return {
      success: false,
      message: 'Invalid email address. Please provide a valid email.'
    };
  }

  // Relaxed phone validation (optional field)
  if (patientPhone) {
    const cleanPhone = patientPhone.replace(/[\s\-\(\)]/g, '');
    console.log('📱 Validating phone:', patientPhone, '-> cleaned:', cleanPhone);
    
    if (!/^(\+?92)?0?3\d{9}$/.test(cleanPhone)) {
      console.log('❌ Invalid phone format');
      return {
        success: false,
        message: 'Invalid phone number. Please provide a valid Pakistani mobile number.'
      };
    }
  }

  // Parse appointment slot
  let startTimeStr, endTimeStr;
  
  try {
    const trimmedSlot = appointmentSlot.trim();
    console.log('🕐 Parsing slot:', trimmedSlot);
    
    if (trimmedSlot.includes(' - ')) {
      [startTimeStr, endTimeStr] = trimmedSlot.split(' - ').map(s => s.trim());
    } else if (trimmedSlot.includes('-')) {
      [startTimeStr, endTimeStr] = trimmedSlot.split('-').map(s => s.trim());
    } else {
      startTimeStr = trimmedSlot;
      endTimeStr = calculateEndTime(startTimeStr);
    }
    
    console.log('⏰ Parsed times:', { startTimeStr, endTimeStr });
    
    if (!startTimeStr || !endTimeStr) {
      throw new Error('Could not parse time slot');
    }
  } catch (error) {
    console.error('❌ Slot parsing error:', error);
    return {
      success: false,
      message: 'Invalid time slot format. Please provide time in format like "10:30 AM" or "10:30 AM - 11:00 AM"'
    };
  }

  // Convert to 24-hour format and create Date objects
  try {
    const start24 = convertTo24Hour(startTimeStr);
    const end24 = convertTo24Hour(endTimeStr);
    
    console.log('🔄 Converted to 24h:', { start24, end24 });
    
    const dateStr = appointmentDate.includes('T') 
      ? appointmentDate.split('T')[0] 
      : appointmentDate;
    
    const startTime = new Date(`${dateStr}T${start24}:00+05:00`);
    const endTime = new Date(`${dateStr}T${end24}:00+05:00`);
    
    console.log('📅 Created dates:', {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    });
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw new Error('Invalid date created');
    }
    
    // Check if slot is still available
    const startTimeUtc = zonedTimeToUtc(startTime, PKT);
    
    const existingAppointment = await Appointment.findOne({
      doctorId,
      startTime: startTimeUtc,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      console.log('❌ Slot already booked');
      return {
        success: false,
        message: 'This time slot was just booked by someone else. Please choose another time.'
      };
    }

    // Verify doctor exists
    const doctorUser = await User.findById(doctorId);
    if (!doctorUser) {
      console.log('❌ Doctor not found');
      return {
        success: false,
        message: 'Doctor not found.'
      };
    }

    // ✅ FIXED: Include patientName in the appointment document
    const appointmentDoc = {
      doctorId,
      patientName,        // ← ADDED: Required field
      patientEmail,       // ← Required field
      patientPhone: patientPhone || undefined,
      startTime: zonedTimeToUtc(startTime, PKT),
      endTime: zonedTimeToUtc(endTime, PKT),
      status: 'booked',
      symptoms: symptoms || 'Voice booking',
      consultationFee: consultationFee || 0,
      notes: `Voice booking. Phone: ${patientPhone || 'Not provided'}`,
      bookingMethod: 'voice'
    };

    console.log('💾 Creating appointment:', appointmentDoc);
    
    const appointment = await Appointment.create(appointmentDoc);

    console.log(`✅ Appointment created: ${appointment._id}`);

    // Send confirmation email (async)
    setImmediate(async () => {
      try {
        await sendEmail({
          to: patientEmail,
          subject: 'Voice Appointment Confirmation - Dr. ' + doctorUser.name,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #4CAF50; text-align: center;">Voice Appointment Confirmed!</h2>
              
              <p>Dear ${patientName},</p>
              <p>Your appointment has been successfully confirmed!</p>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Appointment Details:</h3>
                <p><strong>Doctor:</strong> Dr. ${doctorUser.name}</p>
                <p><strong>Date:</strong> ${formatInTimeZone(startTimeUtc, PKT, "EEEE, MMMM do, yyyy")}</p>
                <p><strong>Time:</strong> ${appointmentSlot}</p>
                <p><strong>Contact:</strong> ${patientPhone || 'Not provided'}</p>
                <p><strong>Symptoms:</strong> ${symptoms || 'Voice booking'}</p>
                ${consultationFee ? `<p><strong>Fee:</strong> PKR ${consultationFee}</p>` : ''}
              </div>
              
              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #1976d2; margin-top: 0;">Important Notes:</h4>
                <ul style="color: #333;">
                  <li>Please arrive 15 minutes before your scheduled appointment</li>
                  <li>Bring a valid ID and any relevant medical documents</li>
                  <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
                </ul>
              </div>
              
              <p style="text-align: center; margin-top: 30px;">
                <strong>Thank you for using our voice booking system!</strong><br>
                <span style="color: #666;">Healthcare Appointment System</span>
              </p>
            </div>
          `
        });
        console.log('✅ Email sent successfully');
      } catch (emailError) {
        console.error('❌ Failed to send confirmation email:', emailError);
      }
    });

    const formattedDate = format(startTime, 'EEEE, MMMM do, yyyy');

    return {
      success: true,
      appointmentId: appointment._id.toString(),
      message: `Perfect! Your appointment is confirmed with Dr. ${doctorUser.name} on ${formattedDate} at ${appointmentSlot}. The consultation fee is ${consultationFee || 'to be confirmed'} PKR. A confirmation email has been sent to ${patientEmail}. Is there anything else I can help you with?`
    };

  } catch (error) {
    console.error('❌ Booking error:', error);
    
    if (error.code === 11000) {
      return {
        success: false,
        message: 'This time slot is already booked. Please choose another time.'
      };
    }

    return {
      success: false,
      message: `There was an error booking your appointment: ${error.message}. Please try again.`
    };
  }
}
/**
 * FIXED: Convert 12-hour format to 24-hour format
 */
function convertTo24Hour(time12h) {
  try {
    const trimmed = time12h.trim().toUpperCase();
    const parts = trimmed.split(/\s+/);
    
    let timePart, modifier;
    if (parts.length === 2) {
      [timePart, modifier] = parts;
    } else if (trimmed.includes('AM') || trimmed.includes('PM')) {
      // Handle "10:30AM" without space
      modifier = trimmed.slice(-2);
      timePart = trimmed.slice(0, -2);
    } else {
      throw new Error('Invalid time format');
    }
    
    let [hours, minutes] = timePart.split(':');
    hours = parseInt(hours, 10);
    minutes = minutes || '00';
    
    // FIXED: Handle 12 AM and 12 PM correctly
    if (modifier === 'AM') {
      if (hours === 12) {
        hours = 0; // 12 AM is 00:00
      }
    } else if (modifier === 'PM') {
      if (hours !== 12) {
        hours += 12; // Convert PM to 24-hour (except 12 PM stays as 12)
      }
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  } catch (error) {
    console.error('❌ Time conversion error:', error, 'Input:', time12h);
    throw new Error(`Invalid time format: ${time12h}`);
  }
}

/**
 * Calculate end time (30 minutes after start time)
 */
function calculateEndTime(startTimeStr) {
  try {
    const [time, modifier] = startTimeStr.trim().split(/\s+/);
    let [hours, minutes] = time.split(':').map(Number);
    
    // Add 30 minutes
    minutes += 30;
    if (minutes >= 60) {
      hours += 1;
      minutes -= 60;
    }
    
    // Handle AM/PM transition
    let endModifier = modifier;
    if (hours === 12 && minutes === 0) {
      endModifier = modifier === 'AM' ? 'PM' : 'AM';
    } else if (hours > 12) {
      hours -= 12;
      endModifier = 'PM';
    } else if (hours === 0) {
      hours = 12;
    }
    
    return `${hours}:${minutes.toString().padStart(2, '0')} ${endModifier}`;
  } catch (error) {
    console.error('❌ End time calculation error:', error);
    throw new Error('Could not calculate end time');
  }
}
/**
 * Helper function to generate time slots from start and end hour
 */
function generateSlotsFromTime(startHour, endHour) {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    // Two 30-minute slots per hour
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
}

export default router;