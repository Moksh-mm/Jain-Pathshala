const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
// 1. Import the new route file
const exportRoutes = require('./exportRoutes');

const app = express();

// ============================================
// CORS - Must be FIRST
// ============================================
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json());

// ============================================
// Helper Functions
// ============================================
function formatTime(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true, 
      timeZone: 'Asia/Kolkata' 
    });
  } catch (e) {
    return '';
  }
}

function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  } catch (e) {
    return '';
  }
}

function getCurrentMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  
  return {
    start: startOfMonth.toISOString().split('T')[0],
    end: endOfMonth.toISOString().split('T')[0]
  };
}

// ============================================
// ALL STUDENTS - Edit passwords here
// ============================================
const ALL_STUDENTS = {
  'aditi': { username: 'Aditi', name: 'Aditi', password: 'Aditi123' },
  'ariha': { username: 'Ariha', name: 'Ariha', password: 'Ariha123' },
  'ashvi': { username: 'Ashvi', name: 'Ashvi', password: 'Ashvi123' },
  'belaben': { username: 'Belaben', name: 'Belaben', password: 'Belaben123' },
  'bhavnaben': { username: 'Bhavnaben', name: 'Bhavnaben', password: 'Bhavnaben123' },
  'devanshiben': { username: 'Devanshiben', name: 'Devanshiben', password: 'Devanshiben123' },
  'dhanvi': { username: 'Dhanvi', name: 'Dhanvi', password: 'Dhanvi123' },
  'falguniben': { username: 'Falguniben', name: 'Falguniben', password: 'Falguniben123' },
  'hareshbhai': { username: 'Hareshbhai', name: 'Hareshbhai', password: 'Hareshbhai123' },
  'harshaben': { username: 'Harshaben', name: 'Harshaben', password: 'Harshaben123' },
  'heliben': { username: 'Heliben', name: 'Heliben', password: 'Heliben123' },
  'hinaben': { username: 'Hinaben', name: 'Hinaben', password: 'Hinaben123' },
  'jainam': { username: 'Jainam', name: 'Jainam', password: 'Jainam123' },
  'jigishaben': { username: 'Jigishaben', name: 'Jigishaben', password: 'Jigishaben123' },
  'kaushikaben': { username: 'Kaushikaben', name: 'Kaushikaben', password: 'Kaushikaben123' },
  'keyan': { username: 'Keyan', name: 'Keyan', password: 'Keyan123' },
  'khushbuben': { username: 'Khushbuben', name: 'Khushbuben', password: 'Khushbuben123' },
  'moksh': { username: 'Moksh', name: 'Moksh', password: 'Moksh123' },
  'moxa': { username: 'Moxa', name: 'Moxa', password: 'Moxa123' },
  'naynaben': { username: 'Naynaben', name: 'Naynaben', password: 'Naynaben123' },
  'nayra': { username: 'Nayra', name: 'Nayra', password: 'Nayra123' },
  'nidhiben': { username: 'Nidhiben', name: 'Nidhiben', password: 'Nidhiben123' },
  'parulben': { username: 'Parulben', name: 'Parulben', password: 'Parulben123' },
  'payalben': { username: 'Payalben', name: 'Payalben', password: 'Payalben123' },
  'prakhar': { username: 'Prakhar', name: 'Prakhar', password: 'Prakhar123' },
  'rajalben': { username: 'Rajalben', name: 'Rajalben', password: 'Rajalben123' },
  'reshmaben': { username: 'Reshmaben', name: 'Reshmaben', password: 'Reshmaben123' },
  'ritaben': { username: 'Ritaben', name: 'Ritaben', password: 'Ritaben123' },
  'saritaben': { username: 'Saritaben', name: 'Saritaben', password: 'Saritaben123' },
  'sattva': { username: 'Sattva', name: 'Sattva', password: 'Sattva123' },
  'shitalben': { username: 'Shitalben', name: 'Shitalben', password: 'Shitalben123' },
  'venya': { username: 'Venya', name: 'Venya', password: 'Venya123' },
  'virti': { username: 'Virti', name: 'Virti', password: 'Virti123' },
  'vivan': { username: 'Vivan', name: 'Vivan', password: 'Vivan123' }
};

// ============================================
// KIDS LIST - Students who see kids-only leaderboard
// ============================================
const KIDS_LIST = [
  'aditi', 'ariha', 'ashvi', 'dhanvi', 'moxa',
  'sattva', 'venya', 'virti', 'vivan', 'prakhar','jainam'
];

function isKidUser(username) {
  if (!username) return false;
  return KIDS_LIST.includes(username.toLowerCase().trim());
}

// ============================================
// ADMIN USERS - Edit passwords here
// ============================================
const ADMIN_USERS = {
  'sannibhai': { id: 'Sannibhai', name: 'Sanni Bhai', password: 'S@123' },
  'admin2': { id: 'admin2', name: 'Jainam', password: 'Admin@456' },
  'nayanbhai': { id: 'Nayanbhai', name: 'Nayanbhai', password: 'Nayanbhai@123' }
};

// ============================================
// MongoDB Connection
// ============================================
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'pathshala';

  if (!uri) return null;

  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }
    cachedDb = cachedClient.db(dbName);
    return cachedDb;
  } catch (error) {
    console.error('MongoDB error:', error);
    return null;
  }
}

async function getCollection(name) {
  const db = await connectToDatabase();
  return db ? db.collection(name) : null;
}

// 2. Share dependencies with other files via app.locals
app.locals.getCollection = getCollection;
app.locals.ALL_STUDENTS = ALL_STUDENTS;

// ============================================
// JWT Helper
// ============================================
const createToken = (payload) => {
  return Buffer.from(JSON.stringify({
    ...payload,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000)
  })).toString('base64');
};

const verifyToken = (token) => {
  try {
    const data = JSON.parse(Buffer.from(token, 'base64').toString());
    return data.exp > Date.now() ? data : null;
  } catch (e) {
    return null;
  }
};

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token required' });
  
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });
  
  req.user = user;
  next();
};

// 3. Register the new export routes
app.use('/api/admin/export', authenticate, exportRoutes);

// ============================================
// Helper: Check if user can act as another user (family)
// ============================================
async function canActAs(currentUsername, targetUsername) {
  try {
    const groups = await getCollection('family_groups');
    if (!groups) return false;

    const group = await groups.findOne({
      members: { $all: [currentUsername, targetUsername] }
    });

    return !!group;
  } catch (e) {
    return false;
  }
}

// Helper function to calculate streaks
function calculateStreaks(dates) {
  if (!dates || dates.length === 0) return { current: 0, max: 0 };
  
  const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
  
  if (uniqueDates.length === 0) return { current: 0, max: 0 };
  
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 1;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const mostRecentDate = new Date(uniqueDates[0]);
  mostRecentDate.setHours(0, 0, 0, 0);
  
  const daysSinceLastAttendance = Math.floor((today - mostRecentDate) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastAttendance > 1) {
    currentStreak = 0;
  } else {
    currentStreak = 1;
  }
  
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const currentDate = new Date(uniqueDates[i]);
    const nextDate = new Date(uniqueDates[i + 1]);
    const diffDays = Math.floor((currentDate - nextDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
      if (daysSinceLastAttendance <= 1 && i === 0) {
        currentStreak = tempStreak;
      }
    } else {
      maxStreak = Math.max(maxStreak, tempStreak);
      tempStreak = 1;
      if (i === 0) {
        currentStreak = daysSinceLastAttendance <= 1 ? 1 : 0;
      }
    }
  }
  
  maxStreak = Math.max(maxStreak, tempStreak, currentStreak);
  
  return { current: currentStreak, max: maxStreak };
}

// ============================================
// Health Routes
// ============================================
app.get('/', (req, res) => {
  res.json({ message: 'Pathshala Backend API', status: 'running' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Pathshala API v1.0' });
});

app.get('/api/health', async (req, res) => {
  let dbStatus = 'not connected';
  let counts = {};

  try {
    const db = await connectToDatabase();
    if (db) {
      dbStatus = 'connected';
      const attendance = await getCollection('attendance');
      const gatha = await getCollection('gatha');
      counts = {
        attendance: attendance ? await attendance.countDocuments() : 0,
        gatha: gatha ? await gatha.countDocuments() : 0
      };
    }
  } catch (e) {
    dbStatus = 'error';
  }

  res.json({ status: 'ok', database: dbStatus, counts, totalStudents: Object.keys(ALL_STUDENTS).length });
});

// ============================================
// Login Routes (with Family Group Support)
// ============================================
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const studentKey = username.toLowerCase().trim();
    let student = ALL_STUDENTS[studentKey];

    // Also check database for dynamically added users
    if (!student) {
      try {
        const usersCollection = await getCollection('users');
        if (usersCollection) {
          const dbUser = await usersCollection.findOne({ 
            username: { $regex: new RegExp('^' + studentKey + '$', 'i') }
          });
          if (dbUser) {
            student = {
              username: dbUser.username,
              name: dbUser.name,
              password: dbUser.password
            };
          }
        }
      } catch (e) {
        console.error('DB user lookup error:', e);
      }
    }

    if (!student) {
      return res.status(401).json({ error: 'User not found' });
    }

    let isPasswordValid = false;

    // Check custom password in passwords collection (hashed)
    try {
      const passwords = await getCollection('passwords');
      if (passwords) {
        const savedPassword = await passwords.findOne({ username: student.username });
        if (savedPassword && savedPassword.password_hash) {
          const bcrypt = require('bcryptjs');
          isPasswordValid = await bcrypt.compare(password, savedPassword.password_hash);
        }
      }
    } catch (e) {
      console.error('Password check error:', e);
    }

    // Check users collection for plain password
    if (!isPasswordValid) {
      try {
        const usersCollection = await getCollection('users');
        if (usersCollection) {
          const dbUser = await usersCollection.findOne({ 
            username: { $regex: new RegExp('^' + studentKey + '$', 'i') }
          });
          if (dbUser && dbUser.password === password) {
            isPasswordValid = true;
          }
        }
      } catch (e) {
        console.error('DB password check error:', e);
      }
    }

    // Check default/hardcoded password
    if (!isPasswordValid) {
      isPasswordValid = password === student.password;
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const isKid = isKidUser(studentKey);

    // Check for family group
    let familyMembers = [];
    let groupName = null;
    
    try {
      const groups = await getCollection('family_groups');
      if (groups) {
        const userGroup = await groups.findOne({
          members: student.username
        });

        if (userGroup) {
          groupName = userGroup.groupName;
          familyMembers = userGroup.members.map(uname => {
            const key = uname.toLowerCase();
            const s = ALL_STUDENTS[key];
            return {
              username: uname,
              name: s?.name || uname,
              isCurrent: uname === student.username
            };
          });
        }
      }
    } catch (e) {
      console.error('Family group check error:', e);
    }

    const token = createToken({
      id: student.username,
      username: student.username,
      name: student.name,
      role: 'student',
      isKid: isKid
    });

    res.json({
      user: {
        id: student.username,
        username: student.username,
        name: student.name,
        role: 'student',
        isKid: isKid
      },
      token,
      familyGroup: {
        groupName,
        members: familyMembers
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Credentials required' });
    }

    const adminKey = username.toLowerCase().trim();
    const admin = ADMIN_USERS[adminKey];

    if (!admin || password !== admin.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      user: { id: admin.id, username: adminKey, name: admin.name, role: 'admin' },
      token: createToken({ id: admin.id, username: adminKey, name: admin.name, role: 'admin' })
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============================================
// Family Members Route
// ============================================
app.get('/api/family-members', authenticate, async (req, res) => {
  try {
    const groups = await getCollection('family_groups');
    if (!groups) return res.json({ familyMembers: [], groupName: null });

    const userGroup = await groups.findOne({
      members: req.user.username
    });

    if (!userGroup) {
      return res.json({ familyMembers: [], groupName: null });
    }

    const familyMembers = userGroup.members.map(username => {
      const key = username.toLowerCase();
      const student = ALL_STUDENTS[key];
      return {
        username: username,
        name: student?.name || username,
        isCurrent: username === req.user.username
      };
    });

    res.json({ 
      familyMembers,
      groupName: userGroup.groupName,
      groupId: userGroup._id.toString()
    });
  } catch (error) {
    console.error('Get family members error:', error);
    res.json({ familyMembers: [], groupName: null });
  }
});

// ============================================
// FIXED: Get data for a specific family member (with monthly stats)
// ============================================
app.get('/api/family-member/:username/data', authenticate, async (req, res) => {
  try {
    const targetUser = req.params.username;

    // Check authorization
    if (targetUser !== req.user.username) {
      const canAct = await canActAs(req.user.username, targetUser);
      if (!canAct) {
        return res.status(403).json({ error: 'You cannot view this user\'s data' });
      }
    }

    const attendance = await getCollection('attendance');
    const gatha = await getCollection('gatha');
    const pendingAttendance = await getCollection('pending_attendance');
    const pendingGatha = await getCollection('pending_gatha');

    const targetKey = targetUser.toLowerCase();
    const targetInfo = ALL_STUDENTS[targetKey] || { name: targetUser, username: targetUser };

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Date ranges
    const yearStart = `${currentYear}-01-01`;
    const yearEnd = `${currentYear}-12-31`;
    const monthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    const monthEnd = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${new Date(currentYear, currentMonth + 1, 0).getDate()}`;
    
    // Today's status
    let todayAttendance = null;
    let todayPendingAttendance = null;
    
    if (attendance) {
      todayAttendance = await attendance.findOne({ username: targetUser, date: today });
    }
    if (pendingAttendance) {
      todayPendingAttendance = await pendingAttendance.findOne({ 
        username: targetUser, 
        date: today,
        status: 'pending'
      });
    }

    // Get all attendance records for streak calculation
    let allAttendance = [];
    let recentAttendance = [];
    let recentGathas = [];
    let pendingGathaList = [];
    let pendingAttendanceList = [];

    if (attendance) {
      allAttendance = await attendance
        .find({ username: targetUser })
        .sort({ date: -1 })
        .toArray();
      
      recentAttendance = allAttendance.slice(0, 60); // Last 60 records
    }

    if (gatha) {
      recentGathas = await gatha
        .find({ username: targetUser })
        .sort({ created_at: -1 })
        .limit(60)
        .toArray();
    }

    if (pendingGatha) {
      pendingGathaList = await pendingGatha
        .find({ username: targetUser, status: 'pending' })
        .sort({ created_at: -1 })
        .toArray();
    }

    if (pendingAttendance) {
      pendingAttendanceList = await pendingAttendance
        .find({ username: targetUser, status: 'pending' })
        .sort({ created_at: -1 })
        .toArray();
    }

    // Calculate streaks
    const streakData = calculateStreaks(allAttendance.map(a => a.date));

    // Calculate yearly stats
    let yearlyAttendance = 0;
    let yearlyNewGathas = 0;

    if (attendance) {
      yearlyAttendance = await attendance.countDocuments({
        username: targetUser,
        date: { $gte: yearStart, $lte: yearEnd }
      });
    }

    if (gatha) {
      const gathaSum = await gatha.aggregate([
        { 
          $match: { 
            username: targetUser,
            date: { $gte: yearStart, $lte: yearEnd },
            type: 'new'
          } 
        },
        { $group: { _id: null, total: { $sum: '$total_gatha' } } }
      ]).toArray();
      yearlyNewGathas = gathaSum[0]?.total || 0;
    }

    // Calculate monthly stats
    let monthlyAttendance = 0;
    let monthlyNewGathas = 0;
    let monthlyRevisionGathas = 0;

    if (attendance) {
      monthlyAttendance = await attendance.countDocuments({
        username: targetUser,
        date: { $gte: monthStart, $lte: monthEnd }
      });
    }

    if (gatha) {
      const monthlyGathaStats = await gatha.aggregate([
        { 
          $match: { 
            username: targetUser,
            date: { $gte: monthStart, $lte: monthEnd }
          } 
        },
        { $group: { _id: '$type', total: { $sum: '$total_gatha' } } }
      ]).toArray();
      
      monthlyGathaStats.forEach(g => {
        if (g._id === 'new') monthlyNewGathas = g.total || 0;
        else monthlyRevisionGathas = g.total || 0;
      });
    }

    res.json({
      user: {
        username: targetUser,
        name: targetInfo.name
      },
      today: {
        isMarked: !!todayAttendance,
        isPending: !!todayPendingAttendance,
        date: today
      },
      stats: {
        yearlyAttendance,
        yearlyNewGathas,
        monthlyAttendance,
        monthlyNewGathas,
        monthlyRevisionGathas,
        currentStreak: streakData.current,
        maxStreak: streakData.max,
        workingDays: 22 // Default working days
      },
      recentAttendance: recentAttendance.map(a => ({
        ...a,
        id: a._id.toString()
      })),
      recentGathas: recentGathas.map(g => ({
        ...g,
        id: g._id.toString()
      })),
      pendingGathas: pendingGathaList.map(g => ({
        ...g,
        id: g._id.toString()
      })),
      pendingAttendance: pendingAttendanceList.map(a => ({
        ...a,
        id: a._id.toString()
      }))
    });
  } catch (error) {
    console.error('Get family member data error:', error);
    res.status(500).json({ error: 'Failed to get data' });
  }
});

// ============================================
// NEW: Get stats for a specific family member for a specific month
// ============================================
app.get('/api/family-member/:username/stats', authenticate, async (req, res) => {
  try {
    const targetUser = req.params.username;

    // Check authorization
    if (targetUser !== req.user.username) {
      const canAct = await canActAs(req.user.username, targetUser);
      if (!canAct) {
        return res.status(403).json({ error: 'You cannot view this user\'s stats' });
      }
    }

    const now = new Date();
    const selectedYear = parseInt(req.query.year) || now.getFullYear();
    const selectedMonth = parseInt(req.query.month) || (now.getMonth() + 1);
    
    const monthStart = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const monthEnd = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${daysInMonth}`;

    const attendance = await getCollection('attendance');
    const gatha = await getCollection('gatha');

    let stats = {
      monthlyAttendance: 0,
      monthlyNewGathas: 0,
      monthlyRevisionGathas: 0,
      currentStreak: 0,
      maxStreak: 0,
      workingDays: 22,
      daysInMonth: daysInMonth
    };

    if (attendance) {
      // Monthly attendance count
      stats.monthlyAttendance = await attendance.countDocuments({
        username: targetUser,
        date: { $gte: monthStart, $lte: monthEnd }
      });

      // Calculate streaks from all attendance
      const allAttendance = await attendance
        .find({ username: targetUser })
        .sort({ date: -1 })
        .toArray();
      
      const streakData = calculateStreaks(allAttendance.map(a => a.date));
      stats.currentStreak = streakData.current;
      stats.maxStreak = streakData.max;
    }

    if (gatha) {
      const monthlyGathaStats = await gatha.aggregate([
        { 
          $match: { 
            username: targetUser,
            date: { $gte: monthStart, $lte: monthEnd }
          } 
        },
        { $group: { _id: '$type', total: { $sum: '$total_gatha' } } }
      ]).toArray();
      
      monthlyGathaStats.forEach(g => {
        if (g._id === 'new') stats.monthlyNewGathas = g.total || 0;
        else stats.monthlyRevisionGathas = g.total || 0;
      });
    }

    res.json(stats);
  } catch (error) {
    console.error('Get family member stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// ============================================
// Attendance Routes
// ============================================
app.get('/api/attendance', authenticate, async (req, res) => {
  try {
    const attendance = await getCollection('attendance');
    if (!attendance) return res.json([]);
    
    const records = await attendance
      .find({ username: req.user.username })
      .sort({ date: -1 })
      .toArray();
      
    res.json(records);
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/attendance/mark', authenticate, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    const attendance = await getCollection('attendance');
    const pendingAttendance = await getCollection('pending_attendance');
    
    if (!attendance || !pendingAttendance) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const existing = await attendance.findOne({
      username: req.user.username,
      date: today
    });

    if (existing) {
      return res.status(400).json({ error: 'Already marked for today' });
    }

    const pendingExisting = await pendingAttendance.findOne({
      username: req.user.username,
      date: today,
      status: 'pending'
    });

    if (pendingExisting) {
      return res.status(400).json({ error: 'Already pending approval' });
    }

    await pendingAttendance.insertOne({
      username: req.user.username,
      student_name: req.user.name || req.user.username,
      date: today,
      status: 'pending',
      created_at: now.toISOString(),
      request_time: formatTime(now.toISOString()),
      request_date: formatDate(now.toISOString())
    });

    res.json({ message: 'Pending approval' });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

// Mark attendance for family member
app.post('/api/attendance/mark-for', authenticate, async (req, res) => {
  try {
    const { forUsername } = req.body;
    const targetUser = forUsername || req.user.username;

    if (targetUser !== req.user.username) {
      const canAct = await canActAs(req.user.username, targetUser);
      if (!canAct) {
        return res.status(403).json({ error: 'You cannot mark attendance for this user' });
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    const attendance = await getCollection('attendance');
    const pendingAttendance = await getCollection('pending_attendance');
    
    if (!attendance || !pendingAttendance) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const targetKey = targetUser.toLowerCase();
    const targetInfo = ALL_STUDENTS[targetKey] || { name: targetUser, username: targetUser };

    const existing = await attendance.findOne({
      username: targetUser,
      date: today
    });

    if (existing) {
      return res.status(400).json({ error: 'Already marked for today' });
    }

    const pendingExisting = await pendingAttendance.findOne({
      username: targetUser,
      date: today,
      status: 'pending'
    });

    if (pendingExisting) {
      return res.status(400).json({ error: 'Already pending approval' });
    }

    await pendingAttendance.insertOne({
      username: targetUser,
      student_name: targetInfo.name,
      date: today,
      status: 'pending',
      created_at: now.toISOString(),
      request_time: formatTime(now.toISOString()),
      request_date: formatDate(now.toISOString()),
      marked_by: req.user.username
    });

    res.json({ message: 'Pending approval for ' + targetInfo.name });
  } catch (error) {
    console.error('Mark attendance for error:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/attendance/unmark', authenticate, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const attendance = await getCollection('attendance');
    const pendingAttendance = await getCollection('pending_attendance');

    if (pendingAttendance) {
      await pendingAttendance.deleteMany({ username: req.user.username, date: today });
    }

    if (attendance) {
      await attendance.deleteMany({ username: req.user.username, date: today });
    }

    res.json({ message: 'Unmarked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.delete('/api/attendance/pending/:id', authenticate, async (req, res) => {
  try {
    const pendingAttendance = await getCollection('pending_attendance');
    if (!pendingAttendance) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const result = await pendingAttendance.deleteOne({
      _id: new ObjectId(req.params.id),
      username: req.user.username,
      status: 'pending'
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Pending attendance not found or already approved' });
    }

    res.json({ message: 'Attendance request cancelled' });
  } catch (error) {
    console.error('Delete pending attendance error:', error);
    res.status(500).json({ error: 'Failed to cancel' });
  }
});

// ============================================
// Gatha Routes
// ============================================
app.get('/api/gatha', authenticate, async (req, res) => {
  try {
    const gatha = await getCollection('gatha');
    if (!gatha) return res.json([]);
    
    const records = await gatha
      .find({ username: req.user.username })
      .sort({ created_at: -1 })
      .toArray();
      
    res.json(records);
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/gatha', authenticate, async (req, res) => {
  try {
    const { type, sutra_name, which_gatha, total_gatha } = req.body || {};

    if (!type || !sutra_name || !which_gatha || !total_gatha) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const pendingGatha = await getCollection('pending_gatha');
    
    if (!pendingGatha) {
      return res.status(500).json({ error: 'Database not available' });
    }

    await pendingGatha.insertOne({
      username: req.user.username,
      student_name: req.user.name || req.user.username,
      type,
      sutra_name,
      which_gatha,
      total_gatha: parseInt(total_gatha),
      date: today,
      status: 'pending',
      created_at: now.toISOString(),
      request_time: formatTime(now.toISOString()),
      request_date: formatDate(now.toISOString())
    });

    res.json({ message: 'Pending approval' });
  } catch (error) {
    console.error('Create gatha error:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

// Add gatha for family member
app.post('/api/gatha-for', authenticate, async (req, res) => {
  try {
    const { forUsername, type, sutra_name, which_gatha, total_gatha } = req.body || {};
    const targetUser = forUsername || req.user.username;

    if (targetUser !== req.user.username) {
      const canAct = await canActAs(req.user.username, targetUser);
      if (!canAct) {
        return res.status(403).json({ error: 'You cannot add gatha for this user' });
      }
    }

    if (!type || !sutra_name || !which_gatha || !total_gatha) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const pendingGatha = await getCollection('pending_gatha');
    
    if (!pendingGatha) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const targetKey = targetUser.toLowerCase();
    const targetInfo = ALL_STUDENTS[targetKey] || { name: targetUser, username: targetUser };

    await pendingGatha.insertOne({
      username: targetUser,
      student_name: targetInfo.name,
      type,
      sutra_name,
      which_gatha,
      total_gatha: parseInt(total_gatha),
      date: today,
      status: 'pending',
      created_at: now.toISOString(),
      request_time: formatTime(now.toISOString()),
      request_date: formatDate(now.toISOString()),
      added_by: req.user.username
    });

    res.json({ message: 'Pending approval for ' + targetInfo.name });
  } catch (error) {
    console.error('Create gatha for error:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

app.put('/api/gatha/pending/:id', authenticate, async (req, res) => {
  try {
    const { sutra_name, which_gatha, total_gatha } = req.body || {};

    if (!sutra_name || !which_gatha || !total_gatha) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const pendingGatha = await getCollection('pending_gatha');
    if (!pendingGatha) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const result = await pendingGatha.updateOne(
      {
        _id: new ObjectId(req.params.id),
        username: req.user.username,
        status: 'pending'
      },
      {
        $set: {
          sutra_name,
          which_gatha,
          total_gatha: parseInt(total_gatha),
          updated_at: new Date().toISOString()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Pending gatha not found or already approved' });
    }

    res.json({ message: 'Gatha updated successfully' });
  } catch (error) {
    console.error('Edit pending gatha error:', error);
    res.status(500).json({ error: 'Failed to update' });
  }
});

app.delete('/api/gatha/pending/:id', authenticate, async (req, res) => {
  try {
    const pendingGatha = await getCollection('pending_gatha');
    if (!pendingGatha) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const result = await pendingGatha.deleteOne({
      _id: new ObjectId(req.params.id),
      username: req.user.username,
      status: 'pending'
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Pending gatha not found or already approved' });
    }

    res.json({ message: 'Gatha request cancelled' });
  } catch (error) {
    console.error('Delete pending gatha error:', error);
    res.status(500).json({ error: 'Failed to cancel' });
  }
});

app.put('/api/gatha/:id', authenticate, async (req, res) => {
  try {
    const { sutra_name, which_gatha, total_gatha } = req.body || {};
    const gatha = await getCollection('gatha');
    
    if (!gatha) return res.status(500).json({ error: 'Database not available' });

    const result = await gatha.updateOne(
      { _id: new ObjectId(req.params.id), username: req.user.username },
      { $set: { sutra_name, which_gatha, total_gatha: parseInt(total_gatha), updated_at: new Date().toISOString() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Gatha not found' });
    }

    res.json({ message: 'Updated' });
  } catch (error) {
    console.error('Update gatha error:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

app.delete('/api/gatha/:id', authenticate, async (req, res) => {
  try {
    const gatha = await getCollection('gatha');
    if (!gatha) return res.status(500).json({ error: 'Database not available' });
    
    const result = await gatha.deleteOne({
      _id: new ObjectId(req.params.id),
      username: req.user.username
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Gatha not found' });
    }
    
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Delete gatha error:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

// ============================================
// Student Pending
// ============================================
app.get('/api/student/pending', authenticate, async (req, res) => {
  try {
    const pendingAttendance = await getCollection('pending_attendance');
    const pendingGatha = await getCollection('pending_gatha');

    let attendance = [], gatha = [];
    
    if (pendingAttendance) {
      const rawAttendance = await pendingAttendance
        .find({ username: req.user.username })
        .sort({ created_at: -1 })
        .toArray();
      
      attendance = rawAttendance.map(item => ({
        ...item,
        id: item._id.toString()
      }));
    }

    if (pendingGatha) {
      const rawGatha = await pendingGatha
        .find({ username: req.user.username })
        .sort({ created_at: -1 })
        .toArray();
      
      gatha = rawGatha.map(item => ({
        ...item,
        id: item._id.toString()
      }));
    }

    res.json({ attendance, gatha });
  } catch (error) {
    console.error('Get student pending error:', error);
    res.json({ attendance: [], gatha: [] });
  }
});

// ============================================
// Stats Routes
// ============================================
app.get('/api/stats/yearly', authenticate, async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const attendance = await getCollection('attendance');
    if (!attendance) return res.json({ totalDaysPresent: 0 });
    
    const count = await attendance.countDocuments({
      username: req.user.username,
      date: { $gte: startDate, $lte: endDate }
    });

    res.json({ totalDaysPresent: count });
  } catch (error) {
    res.json({ totalDaysPresent: 0 });
  }
});

app.get('/api/stats/comprehensive', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const selectedYear = parseInt(req.query.year) || now.getFullYear();
    const selectedMonth = parseInt(req.query.month) || (now.getMonth() + 1);
    const currentYear = selectedYear;
    const currentMonth = selectedMonth - 1;
    
    const yearStart = `${currentYear}-01-01`;
    const yearEnd = `${currentYear}-12-31`;
    const monthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    const monthEnd = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${new Date(currentYear, currentMonth + 1, 0).getDate()}`;
    
    const attendance = await getCollection('attendance');
    const gatha = await getCollection('gatha');
    
    let stats = {
      totalAttendance: 0,
      totalGathas: 0,
      totalNewGathas: 0,
      totalRevisionGathas: 0,
      yearlyAttendance: 0,
      yearlyGathas: 0,
      monthlyAttendance: 0,
      monthlyGathas: 0,
      monthlyNewGathas: 0,
      monthlyRevisionGathas: 0,
      currentStreak: 0,
      maxStreak: 0,
      specialConditions: {
        early_attendance: false,
        night_gatha: false,
        weekend_attendance: false,
        first_day: false
      },
      daysInCurrentMonth: new Date(currentYear, currentMonth + 1, 0).getDate(),
      workingDays: 22
    };
    
    if (attendance) {
      stats.totalAttendance = await attendance.countDocuments({ username: req.user.username });
      stats.yearlyAttendance = await attendance.countDocuments({ 
        username: req.user.username,
        date: { $gte: yearStart, $lte: yearEnd }
      });
      stats.monthlyAttendance = await attendance.countDocuments({ 
        username: req.user.username,
        date: { $gte: monthStart, $lte: monthEnd }
      });
      
      const allAttendance = await attendance
        .find({ username: req.user.username })
        .sort({ date: -1 })
        .toArray();
      
      const streakData = calculateStreaks(allAttendance.map(a => a.date));
      stats.currentStreak = streakData.current;
      stats.maxStreak = streakData.max;
      
      const firstOfMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
      const firstDayAttendance = await attendance.findOne({
        username: req.user.username,
        date: firstOfMonth
      });
      stats.specialConditions.first_day = !!firstDayAttendance;
    }
    
    if (gatha) {
      const lifetimeGathas = await gatha.aggregate([
        { $match: { username: req.user.username } },
        { $group: { _id: '$type', total: { $sum: '$total_gatha' } }}
      ]).toArray();
      
      lifetimeGathas.forEach(g => {
        if (g._id === 'new') stats.totalNewGathas = g.total || 0;
        else stats.totalRevisionGathas = g.total || 0;
      });
      stats.totalGathas = stats.totalNewGathas + stats.totalRevisionGathas;
      
      const yearlyGathas = await gatha.aggregate([
        { $match: { username: req.user.username, date: { $gte: yearStart, $lte: yearEnd } }},
        { $group: { _id: null, total: { $sum: '$total_gatha' } }}
      ]).toArray();
      stats.yearlyGathas = yearlyGathas[0]?.total || 0;
      
      const monthlyGathas = await gatha.aggregate([
        { $match: { username: req.user.username, date: { $gte: monthStart, $lte: monthEnd } }},
        { $group: { _id: '$type', total: { $sum: '$total_gatha' } }}
      ]).toArray();
      
      monthlyGathas.forEach(g => {
        if (g._id === 'new') stats.monthlyNewGathas = g.total || 0;
        else stats.monthlyRevisionGathas = g.total || 0;
      });
      stats.monthlyGathas = stats.monthlyNewGathas + stats.monthlyRevisionGathas;
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Comprehensive stats error:', error);
    res.json({
      totalAttendance: 0, totalGathas: 0, totalNewGathas: 0, totalRevisionGathas: 0,
      yearlyAttendance: 0, yearlyGathas: 0, monthlyAttendance: 0, monthlyGathas: 0,
      monthlyNewGathas: 0, monthlyRevisionGathas: 0, currentStreak: 0, maxStreak: 0,
      specialConditions: {}, daysInCurrentMonth: 22, workingDays: 22
    });
  }
});
// ============================================
// Leaderboard Routes
// ============================================
app.get('/api/leaderboard', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const monthRange = getCurrentMonthRange();
    const start = startDate || monthRange.start;
    const end = endDate || monthRange.end;

    const attendance = await getCollection('attendance');
    const gatha = await getCollection('gatha');

    let attendanceLeaders = [];
    let gathaLeaders = [];

    if (attendance) {
      const attAgg = await attendance.aggregate([
        { $match: { date: { $gte: start, $lte: end } } },
        { $group: { _id: '$username', totalAttendance: { $sum: 1 } } },
        { $sort: { totalAttendance: -1 } },
        { $limit: 10 }
      ]).toArray();

      attendanceLeaders = attAgg.map((item, index) => {
        const studentKey = item._id?.toLowerCase();
        const studentInfo = ALL_STUDENTS[studentKey] || {};
        return {
          rank: index + 1,
          userId: item._id,
          username: item._id,
          name: studentInfo.name || item._id,
          totalAttendance: item.totalAttendance,
          count: item.totalAttendance
        };
      });
    }

    if (gatha) {
      const gathaAgg = await gatha.aggregate([
        { $match: { date: { $gte: start, $lte: end }, type: 'new' } },
        { $group: { _id: '$username', totalGathas: { $sum: '$total_gatha' } } },
        { $sort: { totalGathas: -1 } },
        { $limit: 10 }
      ]).toArray();

      gathaLeaders = gathaAgg.map((item, index) => {
        const studentKey = item._id?.toLowerCase();
        const studentInfo = ALL_STUDENTS[studentKey] || {};
        return {
          rank: index + 1,
          userId: item._id,
          username: item._id,
          name: studentInfo.name || item._id,
          totalGathas: item.totalGathas,
          count: item.totalGathas
        };
      });
    }

    res.json({ attendanceLeaders, gathaLeaders, dateRange: { start, end } });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.json({ attendanceLeaders: [], gathaLeaders: [], dateRange: {} });
  }
});

app.get('/api/leaderboard/kids', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const monthRange = getCurrentMonthRange();
    const start = startDate || monthRange.start;
    const end = endDate || monthRange.end;

    const attendance = await getCollection('attendance');
    const gatha = await getCollection('gatha');

    let attendanceLeaders = [];
    let gathaLeaders = [];

    const kidsUsernames = KIDS_LIST.map(k => {
      const student = ALL_STUDENTS[k];
      return student ? student.username : k.charAt(0).toUpperCase() + k.slice(1);
    });

    if (attendance) {
      const attAgg = await attendance.aggregate([
        { $match: { date: { $gte: start, $lte: end }, username: { $in: kidsUsernames } } },
        { $group: { _id: '$username', totalAttendance: { $sum: 1 } } },
        { $sort: { totalAttendance: -1 } },
        { $limit: 10 }
      ]).toArray();

      attendanceLeaders = attAgg.map((item, index) => {
        const studentKey = item._id?.toLowerCase();
        const studentInfo = ALL_STUDENTS[studentKey] || {};
        return {
          rank: index + 1,
          userId: item._id,
          username: item._id,
          name: studentInfo.name || item._id,
          totalAttendance: item.totalAttendance,
          count: item.totalAttendance
        };
      });
    }

    if (gatha) {
      const gathaAgg = await gatha.aggregate([
        { $match: { date: { $gte: start, $lte: end }, type: 'new', username: { $in: kidsUsernames } } },
        { $group: { _id: '$username', totalGathas: { $sum: '$total_gatha' } } },
        { $sort: { totalGathas: -1 } },
        { $limit: 10 }
      ]).toArray();

      gathaLeaders = gathaAgg.map((item, index) => {
        const studentKey = item._id?.toLowerCase();
        const studentInfo = ALL_STUDENTS[studentKey] || {};
        return {
          rank: index + 1,
          userId: item._id,
          username: item._id,
          name: studentInfo.name || item._id,
          totalGathas: item.totalGathas,
          count: item.totalGathas
        };
      });
    }

    res.json({
      attendanceLeaders,
      gathaLeaders,
      dateRange: { start, end },
      isKidsLeaderboard: true,
      totalKids: KIDS_LIST.length
    });
  } catch (error) {
    console.error('Kids leaderboard error:', error);
    res.json({ attendanceLeaders: [], gathaLeaders: [], dateRange: {}, isKidsLeaderboard: true });
  }
});

app.get('/api/students/stats', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const monthRange = getCurrentMonthRange();
    const start = startDate || monthRange.start;
    const end = endDate || monthRange.end;

    const attendance = await getCollection('attendance');
    const gatha = await getCollection('gatha');

    const studentsStats = await Promise.all(
      Object.values(ALL_STUDENTS).map(async (student) => {
        let monthlyAttendance = 0;
        let monthlyNewGathas = 0;

        if (attendance) {
          monthlyAttendance = await attendance.countDocuments({
            username: student.username,
            date: { $gte: start, $lte: end }
          });
        }

        if (gatha) {
          const gathaSum = await gatha.aggregate([
            { $match: { username: student.username, date: { $gte: start, $lte: end }, type: 'new' } },
            { $group: { _id: null, total: { $sum: '$total_gatha' } } }
          ]).toArray();
          monthlyNewGathas = gathaSum[0]?.total || 0;
        }

        return {
          _id: student.username,
          userId: student.username,
          username: student.username,
          name: student.name,
          monthlyAttendance,
          attendance: monthlyAttendance,
          monthlyNewGathas,
          newGathas: monthlyNewGathas,
          gathas: monthlyNewGathas
        };
      })
    );

    res.json(studentsStats);
  } catch (error) {
    console.error('Students stats error:', error);
    res.json([]);
  }
});

app.get('/api/analytics/leaderboard', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate || `${new Date().getFullYear()}-01-01`;
    const end = endDate || `${new Date().getFullYear()}-12-31`;

    let result = {
      attendanceLeader: null,
      gathaStats: { totalPathshalaGathas: 0, totalAttendance: 0, gathaLeader: null },
      attendanceLeaders: [],
      gathaLeaders: []
    };

    const attendance = await getCollection('attendance');
    const gatha = await getCollection('gatha');

    if (attendance) {
      result.gathaStats.totalAttendance = await attendance.countDocuments({ date: { $gte: start, $lte: end } });

      const attLeaders = await attendance.aggregate([
        { $match: { date: { $gte: start, $lte: end } } },
        { $group: { _id: '$username', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray();

      if (attLeaders.length > 0) {
        result.attendanceLeaders = attLeaders.map((item, index) => {
          const studentKey = item._id?.toLowerCase();
          const studentInfo = ALL_STUDENTS[studentKey] || {};
          return {
            rank: index + 1,
            userId: item._id,
            username: item._id,
            name: studentInfo.name || item._id,
            totalAttendance: item.count,
            count: item.count
          };
        });

        const topAtt = attLeaders[0];
        const topAttKey = topAtt._id?.toLowerCase();
        const topAttInfo = ALL_STUDENTS[topAttKey] || {};
        result.attendanceLeader = {
          name: topAttInfo.name || topAtt._id,
          username: topAtt._id,
          attendance_count: topAtt.count
        };
      }
    }

    if (gatha) {
      const totalGathas = await gatha.aggregate([
        { $match: { date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$total_gatha' } } }
      ]).toArray();
      result.gathaStats.totalPathshalaGathas = totalGathas[0]?.total || 0;

      const gathaLeaders = await gatha.aggregate([
        { $match: { date: { $gte: start, $lte: end }, type: 'new' } },
        { $group: { _id: '$username', count: { $sum: '$total_gatha' } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray();

      if (gathaLeaders.length > 0) {
        result.gathaLeaders = gathaLeaders.map((item, index) => {
          const studentKey = item._id?.toLowerCase();
          const studentInfo = ALL_STUDENTS[studentKey] || {};
          return {
            rank: index + 1,
            userId: item._id,
            username: item._id,
            name: studentInfo.name || item._id,
            totalGathas: item.count,
            count: item.count
          };
        });

        const topGatha = gathaLeaders[0];
        const topGathaKey = topGatha._id?.toLowerCase();
        const topGathaInfo = ALL_STUDENTS[topGathaKey] || {};
        result.gathaStats.gathaLeader = {
          name: topGathaInfo.name || topGatha._id,
          username: topGatha._id,
          count: topGatha.count
        };
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.json({
      attendanceLeader: null,
      gathaStats: { totalPathshalaGathas: 0, totalAttendance: 0, gathaLeader: null },
      attendanceLeaders: [],
      gathaLeaders: []
    });
  }
});

// ============================================
// History Routes - UPDATED FOR FAMILY SWITCHING
// ============================================
app.get('/api/history/:year/:month', authenticate, async (req, res) => {
  try {
    const { year, month } = req.params;
    const { studentId } = req.query; 
    
    let targetUsername = req.user.username; 

    if (studentId && studentId !== req.user.username) {
      const authorized = await canActAs(req.user.username, studentId);
      if (!authorized) {
        return res.status(403).json({ error: 'Not authorized to view this student\'s history' });
      }
      targetUsername = studentId;
    }

    const dailyActivity = {};

    const pm = month.toString().padStart(2, '0');
    const daysInMonth = new Date(year, month, 0).getDate();
    const start = `${year}-${pm}-01`;
    const end = `${year}-${pm}-${daysInMonth}`;

    const attendance = await getCollection('attendance');
    const gatha = await getCollection('gatha');

    if (attendance) {
      const attRecords = await attendance.find({
        username: targetUsername,
        date: { $gte: start, $lte: end }
      }).toArray();

      attRecords.forEach(r => {
        dailyActivity[r.date] = { present: true, gathas: { new: 0, revision: 0 }, details: [] };
      });
    }

    if (gatha) {
      const gathaRecords = await gatha.find({
        username: targetUsername,
        date: { $gte: start, $lte: end }
      }).toArray();

      gathaRecords.forEach(r => {
        if (!dailyActivity[r.date]) {
          dailyActivity[r.date] = { present: false, gathas: { new: 0, revision: 0 }, details: [] };
        }
        const count = parseInt(r.total_gatha) || 0;
        dailyActivity[r.date].gathas[r.type || 'new'] += count;
        dailyActivity[r.date].details.push(r);
      });
    }

    res.json({ dailyActivity });
  } catch (error) {
    console.error('History error:', error);
    res.json({ dailyActivity: {} });
  }
});

app.get('/api/history/range', authenticate, async (req, res) => {
  try {
    const { startDate, endDate, studentId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate required' });
    }

    let targetUsername = req.user.username;

    if (studentId && studentId !== req.user.username) {
      const authorized = await canActAs(req.user.username, studentId);
      if (!authorized) {
        return res.status(403).json({ error: 'Not authorized to view this student\'s history' });
      }
      targetUsername = studentId;
    }
    
    const dailyActivity = {};
    const attendance = await getCollection('attendance');
    const gatha = await getCollection('gatha');
    
    if (attendance) {
      const attRecords = await attendance.find({
        username: targetUsername,
        date: { $gte: startDate, $lte: endDate }
      }).toArray();
      
      attRecords.forEach(r => {
        dailyActivity[r.date] = {
          present: true,
          gathas: { new: 0, revision: 0 },
          details: [],
          attendanceTime: r.created_at
        };
      });
    }
    
    if (gatha) {
      const gathaRecords = await gatha.find({
        username: targetUsername,
        date: { $gte: startDate, $lte: endDate }
      }).toArray();
      
      gathaRecords.forEach(r => {
        if (!dailyActivity[r.date]) {
          dailyActivity[r.date] = { present: false, gathas: { new: 0, revision: 0 }, details: [] };
        }
        const count = parseInt(r.total_gatha) || 0;
        const type = r.type || 'new';
        dailyActivity[r.date].gathas[type] += count;
        dailyActivity[r.date].details.push({
          id: r._id.toString(),
          type: r.type,
          sutra_name: r.sutra_name,
          which_gatha: r.which_gatha,
          total_gatha: r.total_gatha,
          created_at: r.created_at
        });
      });
    }
    
    let totalDays = 0, totalNewGathas = 0, totalRevisionGathas = 0;
    Object.values(dailyActivity).forEach(day => {
      if (day.present) totalDays++;
      totalNewGathas += day.gathas.new;
      totalRevisionGathas += day.gathas.revision;
    });
    
    res.json({ 
      dailyActivity,
      summary: { totalDays, totalNewGathas, totalRevisionGathas, totalGathas: totalNewGathas + totalRevisionGathas }
    });
  } catch (error) {
    console.error('History range error:', error);
    res.json({ dailyActivity: {}, summary: {} });
  }
});

// ============================================
// Achievement Routes
// ============================================
app.get('/api/achievements', authenticate, async (req, res) => {
  try {
    const achievements = await getCollection('achievements');
    if (!achievements) return res.json({ unlocked: [], xp: 0 });
    
    const userAchievements = await achievements.find({ username: req.user.username }).toArray();
    const totalXP = userAchievements.reduce((sum, a) => sum + (a.xp || 0), 0);
    
    res.json({ unlocked: userAchievements, xp: totalXP });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.json({ unlocked: [], xp: 0 });
  }
});

app.post('/api/achievements/unlock', authenticate, async (req, res) => {
  try {
    const { achievementId, xp } = req.body;
    
    if (!achievementId) {
      return res.status(400).json({ error: 'Achievement ID required' });
    }
    
    const achievements = await getCollection('achievements');
    if (!achievements) {
      return res.status(500).json({ error: 'Database not available' });
    }
    
    const existing = await achievements.findOne({
      username: req.user.username,
      achievementId: achievementId
    });
    
    if (existing) {
      return res.json({ message: 'Already unlocked', alreadyUnlocked: true });
    }
    
    await achievements.insertOne({
      username: req.user.username,
      achievementId: achievementId,
      xp: xp || 0,
      unlockedAt: new Date().toISOString()
    });
    
    res.json({ message: 'Achievement unlocked!', achievementId, xp });
  } catch (error) {
    console.error('Unlock achievement error:', error);
    res.status(500).json({ error: 'Failed to unlock achievement' });
  }
});

// ============================================
// Profile Routes
// ============================================
app.get('/api/profile', authenticate, async (req, res) => {
  try {
    const profiles = await getCollection('profiles');
    let profile = null;
    
    if (profiles) {
      profile = await profiles.findOne({ username: req.user.username });
    }
    
    res.json({
      username: req.user.username,
      name: req.user.name,
      ...profile,
      joinedDate: profile?.joinedDate || null
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.json({ username: req.user.username, name: req.user.name });
  }
});

app.put('/api/profile', authenticate, async (req, res) => {
  try {
    const { showTips, theme, language } = req.body;
    
    const profiles = await getCollection('profiles');
    if (!profiles) {
      return res.status(500).json({ error: 'Database not available' });
    }
    
    await profiles.updateOne(
      { username: req.user.username },
      { 
        $set: { showTips, theme, language, updatedAt: new Date().toISOString() },
        $setOnInsert: { username: req.user.username, joinedDate: new Date().toISOString() }
      },
      { upsert: true }
    );
    
    res.json({ message: 'Profile updated' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.post('/api/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const studentKey = req.user.username.toLowerCase();
    const student = ALL_STUDENTS[studentKey];
    
    if (!student) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let isCurrentPasswordValid = false;
    const bcrypt = require('bcryptjs');
    
    const passwords = await getCollection('passwords');
    if (passwords) {
      const savedPassword = await passwords.findOne({ username: req.user.username });
      if (savedPassword && savedPassword.password_hash) {
        isCurrentPasswordValid = await bcrypt.compare(currentPassword, savedPassword.password_hash);
      }
    }
    
    if (!isCurrentPasswordValid) {
      isCurrentPasswordValid = currentPassword === student.password;
    }
    
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    if (passwords) {
      await passwords.updateOne(
        { username: req.user.username },
        { $set: { password_hash: hashedPassword, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
    }
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Admin Stats
app.get('/api/admin/stats', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await getCollection('attendance');
    const pendingAttendance = await getCollection('pending_attendance');
    const pendingGatha = await getCollection('pending_gatha');

    const stats = {
      total_students: Object.keys(ALL_STUDENTS).length,
      today_attendance: attendance ? await attendance.countDocuments({ date: today }) : 0,
      pending_attendance: pendingAttendance ? await pendingAttendance.countDocuments({ status: 'pending' }) : 0,
      pending_gatha: pendingGatha ? await pendingGatha.countDocuments({ status: 'pending' }) : 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    res.json({ pending_attendance: 0, pending_gatha: 0, total_students: 34, today_attendance: 0 });
  }
});

// Admin Pending
app.get('/api/admin/pending', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const pendingAttendance = await getCollection('pending_attendance');
    const pendingGatha = await getCollection('pending_gatha');

    let attendance = [], gatha = [];
    
    if (pendingAttendance) {
      const rawAttendance = await pendingAttendance.find({ status: 'pending' }).sort({ created_at: -1 }).toArray();
      attendance = rawAttendance.map(item => ({
        ...item,
        id: item._id.toString(),
        student_name: item.student_name || item.username || 'Unknown',
        display_name: item.student_name || item.username || 'Unknown',
        formatted_time: item.request_time || formatTime(item.created_at),
        formatted_date: item.request_date || formatDate(item.created_at) || item.date
      }));
    }

    if (pendingGatha) {
      const rawGatha = await pendingGatha.find({ status: 'pending' }).sort({ created_at: -1 }).toArray();
      gatha = rawGatha.map(item => ({
        ...item,
        id: item._id.toString(),
        student_name: item.student_name || item.username || 'Unknown',
        display_name: item.student_name || item.username || 'Unknown',
        formatted_time: item.request_time || formatTime(item.created_at),
        formatted_date: item.request_date || formatDate(item.created_at) || item.date
      }));
    }

    res.json({ attendance, gatha, totalPending: attendance.length + gatha.length });
  } catch (error) {
    console.error('Admin pending error:', error);
    res.json({ attendance: [], gatha: [], totalPending: 0 });
  }
});

// Approve/Reject Attendance
app.post('/api/admin/attendance/approve/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const pendingAttendance = await getCollection('pending_attendance');
    const attendance = await getCollection('attendance');

    if (!pendingAttendance || !attendance) return res.status(500).json({ error: 'Database not available' });

    const pending = await pendingAttendance.findOne({ _id: new ObjectId(req.params.id), status: 'pending' });
    if (!pending) return res.status(404).json({ error: 'Not found' });

    await attendance.insertOne({
      username: pending.username,
      student_name: pending.student_name || pending.username,
      date: pending.date,
      created_at: new Date().toISOString(),
      approved_by: req.user.username,
      approved_at: new Date().toISOString()
    });

    await pendingAttendance.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: req.user.username } }
    );

    res.json({ message: 'Approved' });
  } catch (error) {
    console.error('Approve attendance error:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/admin/attendance/reject/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const pendingAttendance = await getCollection('pending_attendance');
    if (!pendingAttendance) return res.status(500).json({ error: 'Database not available' });

    await pendingAttendance.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: req.user.username } }
    );

    res.json({ message: 'Rejected' });
  } catch (error) {
    console.error('Reject attendance error:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

// Approve/Reject Gatha
app.post('/api/admin/gatha/approve/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const pendingGatha = await getCollection('pending_gatha');
    const gatha = await getCollection('gatha');

    if (!pendingGatha || !gatha) return res.status(500).json({ error: 'Database not available' });

    const pending = await pendingGatha.findOne({ _id: new ObjectId(req.params.id), status: 'pending' });
    if (!pending) return res.status(404).json({ error: 'Not found' });

    await gatha.insertOne({
      username: pending.username,
      student_name: pending.student_name || pending.username,
      type: pending.type,
      sutra_name: pending.sutra_name,
      which_gatha: pending.which_gatha,
      total_gatha: pending.total_gatha,
      date: pending.date,
      created_at: new Date().toISOString(),
      approved_by: req.user.username,
      approved_at: new Date().toISOString()
    });

    await pendingGatha.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: req.user.username } }
    );

    res.json({ message: 'Approved' });
  } catch (error) {
    console.error('Approve gatha error:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/admin/gatha/reject/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const pendingGatha = await getCollection('pending_gatha');
    if (!pendingGatha) return res.status(500).json({ error: 'Database not available' });

    await pendingGatha.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: req.user.username } }
    );

    res.json({ message: 'Rejected' });
  } catch (error) {
    console.error('Reject gatha error:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

// Approve All
app.post('/api/admin/approve-all', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const pendingAttendance = await getCollection('pending_attendance');
    const pendingGatha = await getCollection('pending_gatha');
    const attendance = await getCollection('attendance');
    const gatha = await getCollection('gatha');

    let aa = 0, ag = 0;
    const now = new Date().toISOString();

    if (pendingAttendance && attendance) {
      const pendingAtt = await pendingAttendance.find({ status: 'pending' }).toArray();
      for (const p of pendingAtt) {
        await attendance.insertOne({
          username: p.username,
          student_name: p.student_name || p.username,
          date: p.date,
          created_at: now,
          approved_by: req.user.username,
          approved_at: now
        });
        await pendingAttendance.updateOne(
          { _id: p._id },
          { $set: { status: 'approved', reviewed_at: now, reviewed_by: req.user.username } }
        );
        aa++;
      }
    }

    if (pendingGatha && gatha) {
      const pendingG = await pendingGatha.find({ status: 'pending' }).toArray();
      for (const p of pendingG) {
        await gatha.insertOne({
          username: p.username,
          student_name: p.student_name || p.username,
          type: p.type,
          sutra_name: p.sutra_name,
          which_gatha: p.which_gatha,
          total_gatha: p.total_gatha,
          date: p.date,
          created_at: now,
          approved_by: req.user.username,
          approved_at: now
        });
        await pendingGatha.updateOne(
          { _id: p._id },
          { $set: { status: 'approved', reviewed_at: now, reviewed_by: req.user.username } }
        );
        ag++;
      }
    }

    res.json({ approved: { attendance: aa, gatha: ag } });
  } catch (error) {
    console.error('Approve all error:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

// ============================================
// Admin Students Routes
// ============================================
app.get('/api/admin/students', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const { startDate, endDate } = req.query;
    const start = startDate || '2020-01-01';
    const end = endDate || '2099-12-31';

    const attendance = await getCollection('attendance');
    const gatha = await getCollection('gatha');

    const studentsWithStats = await Promise.all(
      Object.values(ALL_STUDENTS).map(async (student) => {
        let attendance_count = 0, new_gathas = 0, revision_gathas = 0;

        if (attendance) {
          attendance_count = await attendance.countDocuments({ 
            username: student.username,
            date: { $gte: start, $lte: end }
          });
        }

        if (gatha) {
          const gathaStats = await gatha.aggregate([
            { $match: { username: student.username, date: { $gte: start, $lte: end } } },
            { $group: { _id: '$type', total: { $sum: '$total_gatha' } } }
          ]).toArray();

          gathaStats.forEach(stat => {
            if (stat._id === 'new') new_gathas = stat.total || 0;
            else if (stat._id === 'revision') revision_gathas = stat.total || 0;
          });
        }

        return {
          id: student.username,
          username: student.username,
          name: student.name,
          attendance_count,
          total_gathas: new_gathas + revision_gathas,
          new_gathas,
          revision_gathas
        };
      })
    );

    studentsWithStats.sort((a, b) => a.name.localeCompare(b.name));
    res.json(studentsWithStats);
  } catch (error) {
    console.error('Admin students error:', error);
    res.json([]);
  }
});

app.get('/api/admin/student/:id/activity', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const { startDate, endDate } = req.query;
    const studentId = req.params.id;
    const start = startDate || '2020-01-01';
    const end = endDate || '2099-12-31';

    const attendance = await getCollection('attendance');
    const gatha = await getCollection('gatha');

    let attendanceRecords = [], gathaRecords = [], recentActivity = [];
    let gathaStats = { new: 0, revision: 0 };

    const studentKey = studentId.toLowerCase();
    const studentInfo = ALL_STUDENTS[studentKey] || { name: studentId, username: studentId };

    if (attendance) {
      attendanceRecords = await attendance
        .find({ username: studentId, date: { $gte: start, $lte: end } })
        .sort({ date: -1 })
        .toArray();

      attendanceRecords.forEach(a => {
        recentActivity.push({ type: 'attendance', date: a.date, created_at: a.created_at || a.date });
      });
    }

    if (gatha) {
      gathaRecords = await gatha
        .find({ username: studentId, date: { $gte: start, $lte: end } })
        .sort({ date: -1 })
        .toArray();

      gathaRecords.forEach(g => {
        const count = parseInt(g.total_gatha) || 0;
        if (g.type === 'new') gathaStats.new += count;
        else gathaStats.revision += count;

        recentActivity.push({
          type: 'gatha',
          date: g.date,
          sutra_name: g.sutra_name,
          which_gatha: g.which_gatha,
          total_gatha: g.total_gatha,
          gatha_type: g.type,
          created_at: g.created_at || g.date
        });
      });
    }

    recentActivity.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));

    res.json({
      studentId,
      studentName: studentInfo.name,
      attendance: attendanceRecords,
      gathas: gathaRecords,
      gathaStats,
      recentActivity: recentActivity.slice(0, 30),
      summary: {
        totalAttendance: attendanceRecords.length,
        totalNewGathas: gathaStats.new,
        totalRevisions: gathaStats.revision,
        totalGathas: gathaStats.new + gathaStats.revision
      }
    });
  } catch (error) {
    console.error('Student activity error:', error);
    res.json({
      studentId: req.params.id,
      studentName: req.params.id,
      attendance: [],
      gathas: [],
      gathaStats: { new: 0, revision: 0 },
      recentActivity: [],
      summary: { totalAttendance: 0, totalNewGathas: 0, totalRevisions: 0, totalGathas: 0 }
    });
  }
});

app.get('/api/admin/top-students', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const { startDate, endDate, limit = 10, gathaType } = req.query;
    const start = startDate || '2020-01-01';
    const end = endDate || '2099-12-31';

    const attendance = await getCollection('attendance');
    const gatha = await getCollection('gatha');

    let attendanceLeaders = [], gathaLeaders = [];

    if (attendance) {
      attendanceLeaders = await attendance.aggregate([
        { $match: { date: { $gte: start, $lte: end } } },
        { $group: { _id: '$username', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: parseInt(limit) }
      ]).toArray();
    }

    if (gatha) {
      const gathaMatch = { date: { $gte: start, $lte: end } };
      if (gathaType === 'new') gathaMatch.type = 'new';

      gathaLeaders = await gatha.aggregate([
        { $match: gathaMatch },
        { $group: { _id: '$username', count: { $sum: '$total_gatha' } } },
        { $sort: { count: -1 } },
        { $limit: parseInt(limit) }
      ]).toArray();
    }

    const topAttendance = attendanceLeaders.map(s => {
      const key = s._id?.toLowerCase();
      const info = ALL_STUDENTS[key] || {};
      return { username: s._id, name: info.name || s._id, count: s.count };
    });

    const topGatha = gathaLeaders.map(s => {
      const key = s._id?.toLowerCase();
      const info = ALL_STUDENTS[key] || {};
      return { username: s._id, name: info.name || s._id, count: s.count };
    });

    res.json({ topAttendance, topGatha, dateRange: { start, end }, gathaType: gathaType || 'all' });
  } catch (error) {
    console.error('Top students error:', error);
    res.json({ topAttendance: [], topGatha: [] });
  }
});

// ============================================
// Admin User Management
// ============================================
app.get('/api/admin/users', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const usersCollection = await getCollection('users');
    const passwordsCollection = await getCollection('passwords');
    
    let customPasswords = {};
    if (passwordsCollection) {
      const pwdRecords = await passwordsCollection.find({}).toArray();
      pwdRecords.forEach(p => {
        customPasswords[p.username?.toLowerCase()] = p.plainPassword || null;
      });
    }

    let dbUsers = [];
    if (usersCollection) {
      dbUsers = await usersCollection.find({}).toArray();
    }

    const allUsersList = [];
    
    Object.entries(ALL_STUDENTS).forEach(([key, student]) => {
      const dbUser = dbUsers.find(u => u.username?.toLowerCase() === key.toLowerCase());
      const customPwd = customPasswords[key.toLowerCase()];
      
      allUsersList.push({
        id: dbUser ? dbUser._id.toString() : key,
        username: student.username,
        name: student.name,
        password: dbUser?.password || customPwd || student.password,
        role: dbUser?.role || 'student',
        source: dbUser ? 'database' : 'hardcoded'
      });
    });

    dbUsers.forEach(dbUser => {
      const existsInHardcoded = Object.keys(ALL_STUDENTS).some(
        key => key.toLowerCase() === dbUser.username?.toLowerCase()
      );
      
      if (!existsInHardcoded) {
        allUsersList.push({
          id: dbUser._id.toString(),
          username: dbUser.username,
          name: dbUser.name,
          password: dbUser.password,
          role: dbUser.role || 'student',
          source: 'database'
        });
      }
    });

    allUsersList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    res.json(allUsersList);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/admin/users', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const { username, password, name, role } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ error: 'Username, password and name are required' });
    }

    if (username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
    if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });

    const usersCollection = await getCollection('users');
    if (!usersCollection) return res.status(500).json({ error: 'Database not available' });

    const normalizedUsername = username.toLowerCase().trim();

    const hardcodedUser = ALL_STUDENTS[normalizedUsername];
    if (hardcodedUser && hardcodedUser.password === password) {
      return res.status(400).json({ error: 'User with this username and password already exists' });
    }

    const existingUser = await usersCollection.findOne({ 
      username: { $regex: new RegExp('^' + normalizedUsername + '$', 'i') },
      password: password
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this username and password already exists' });
    }

    const result = await usersCollection.insertOne({
      username: username.trim(),
      password: password,
      name: name.trim(),
      role: role || 'student',
      createdAt: new Date().toISOString(),
      createdBy: req.user.username
    });

    ALL_STUDENTS[normalizedUsername] = {
      username: username.trim(),
      name: name.trim(),
      password: password
    };

    res.json({ message: 'User added successfully', userId: result.insertedId.toString() });
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({ error: 'Failed to add user' });
  }
});

app.put('/api/admin/users/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const { username, password, name, role } = req.body;
    const userId = req.params.id;

    if (!username || !name) return res.status(400).json({ error: 'Username and name are required' });

    const usersCollection = await getCollection('users');
    if (!usersCollection) return res.status(500).json({ error: 'Database not available' });

    const normalizedUsername = username.toLowerCase().trim();

    const updateData = {
      username: username.trim(),
      name: name.trim(),
      role: role || 'student',
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.username
    };

    if (password && password.trim()) {
      updateData.password = password;
    }

    let result;
    try {
      result = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: updateData }
      );
    } catch (e) {
      result = await usersCollection.updateOne(
        { username: { $regex: new RegExp('^' + userId + '$', 'i') } },
        { $set: updateData },
        { upsert: true }
      );
    }

    if (result.matchedCount === 0) {
      await usersCollection.insertOne({
        ...updateData,
        password: password || ALL_STUDENTS[normalizedUsername]?.password || 'default123',
        createdAt: new Date().toISOString()
      });
    }

    if (ALL_STUDENTS[normalizedUsername]) {
      ALL_STUDENTS[normalizedUsername].name = name.trim();
      ALL_STUDENTS[normalizedUsername].username = username.trim();
      if (password) ALL_STUDENTS[normalizedUsername].password = password;
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/admin/users/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const userId = req.params.id;
    const usersCollection = await getCollection('users');
    if (!usersCollection) return res.status(500).json({ error: 'Database not available' });

    let result;
    try {
      result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
    } catch (e) {
      result = await usersCollection.deleteOne({ 
        username: { $regex: new RegExp('^' + userId + '$', 'i') } 
      });
    }

    if (result.deletedCount === 0) {
      const normalizedId = userId.toLowerCase();
      if (ALL_STUDENTS[normalizedId]) {
        return res.status(400).json({ error: 'Cannot delete hardcoded user' });
      }
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ============================================
// Admin Add Attendance/Gatha for Student
// ============================================
app.post('/api/admin/attendance/add', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const { username, date } = req.body;

    if (!username || !date) return res.status(400).json({ error: 'Username and date are required' });

    const attendance = await getCollection('attendance');
    if (!attendance) return res.status(500).json({ error: 'Database not available' });

    const existing = await attendance.findOne({ username, date });
    if (existing) return res.status(400).json({ error: 'Attendance already marked for this date' });

    const studentKey = username.toLowerCase();
    const studentInfo = ALL_STUDENTS[studentKey] || { name: username };

    await attendance.insertOne({
      username: username,
      student_name: studentInfo.name,
      date: date,
      created_at: new Date().toISOString(),
      added_by: req.user.username,
      source: 'admin_direct_entry',
      approved_by: req.user.username,
      approved_at: new Date().toISOString()
    });

    res.json({ message: 'Attendance added successfully' });
  } catch (error) {
    console.error('Admin add attendance error:', error);
    res.status(500).json({ error: 'Failed to add attendance' });
  }
});

app.post('/api/admin/gatha/add', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const { username, date, sutraName, whichGatha, totalGatha, type } = req.body;

    if (!username || !date || !sutraName || !totalGatha) {
      return res.status(400).json({ error: 'Username, date, sutra name and total gatha are required' });
    }

    const gatha = await getCollection('gatha');
    if (!gatha) return res.status(500).json({ error: 'Database not available' });

    const studentKey = username.toLowerCase();
    const studentInfo = ALL_STUDENTS[studentKey] || { name: username };

    await gatha.insertOne({
      username: username,
      student_name: studentInfo.name,
      type: type || 'new',
      sutra_name: sutraName,
      which_gatha: whichGatha || '',
      total_gatha: parseInt(totalGatha),
      date: date,
      created_at: new Date().toISOString(),
      added_by: req.user.username,
      source: 'admin_direct_entry',
      approved_by: req.user.username,
      approved_at: new Date().toISOString()
    });

    res.json({ message: 'Gatha added successfully' });
  } catch (error) {
    console.error('Admin add gatha error:', error);
    res.status(500).json({ error: 'Failed to add gatha' });
  }
});

// ============================================
// Admin Family Groups
// ============================================
app.get('/api/admin/family-groups', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const groups = await getCollection('family_groups');
    if (!groups) return res.json([]);

    const allGroups = await groups.find({}).sort({ groupName: 1 }).toArray();
    
    const enrichedGroups = allGroups.map(group => ({
      id: group._id.toString(),
      groupName: group.groupName,
      members: group.members.map(username => {
        const key = username.toLowerCase();
        const student = ALL_STUDENTS[key];
        return { username: username, name: student?.name || username };
      }),
      createdAt: group.createdAt,
      createdBy: group.createdBy
    }));

    res.json(enrichedGroups);
  } catch (error) {
    console.error('Get family groups error:', error);
    res.json([]);
  }
});

app.post('/api/admin/family-groups', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const { groupName, members } = req.body;

    if (!groupName || !members || members.length < 2) {
      return res.status(400).json({ error: 'Group name and at least 2 members required' });
    }

    const groups = await getCollection('family_groups');
    if (!groups) return res.status(500).json({ error: 'Database not available' });

    const existingGroups = await groups.find({ members: { $in: members } }).toArray();

    if (existingGroups.length > 0) {
      const conflictingMembers = existingGroups.flatMap(g => g.members.filter(m => members.includes(m)));
      return res.status(400).json({ 
        error: `These members are already in other groups: ${[...new Set(conflictingMembers)].join(', ')}` 
      });
    }

    await groups.insertOne({
      groupName: groupName.trim(),
      members: members,
      createdAt: new Date().toISOString(),
      createdBy: req.user.username
    });

    res.json({ message: 'Family group created successfully' });
  } catch (error) {
    console.error('Create family group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

app.put('/api/admin/family-groups/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const { groupName, members } = req.body;
    const groupId = req.params.id;

    if (!groupName || !members || members.length < 2) {
      return res.status(400).json({ error: 'Group name and at least 2 members required' });
    }

    const groups = await getCollection('family_groups');
    if (!groups) return res.status(500).json({ error: 'Database not available' });

    const existingGroups = await groups.find({
      _id: { $ne: new ObjectId(groupId) },
      members: { $in: members }
    }).toArray();

    if (existingGroups.length > 0) {
      const conflictingMembers = existingGroups.flatMap(g => g.members.filter(m => members.includes(m)));
      return res.status(400).json({ 
        error: `These members are already in other groups: ${[...new Set(conflictingMembers)].join(', ')}` 
      });
    }

    await groups.updateOne(
      { _id: new ObjectId(groupId) },
      { $set: { groupName: groupName.trim(), members: members, updatedAt: new Date().toISOString(), updatedBy: req.user.username } }
    );

    res.json({ message: 'Family group updated successfully' });
  } catch (error) {
    console.error('Update family group error:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

app.delete('/api/admin/family-groups/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const groups = await getCollection('family_groups');
    if (!groups) return res.status(500).json({ error: 'Database not available' });

    await groups.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Family group deleted successfully' });
  } catch (error) {
    console.error('Delete family group error:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// ============================================
// Bulk add attendance
// ============================================
app.post('/api/admin/add-attendance-bulk', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const { entries } = req.body || {};

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'Entries array required' });
    }

    const attendance = await getCollection('attendance');
    if (!attendance) return res.status(500).json({ error: 'Database not available' });

    let added = 0, skipped = 0;

    for (const entry of entries) {
      const { username, date } = entry;
      
      if (!username || !date) {
        skipped++;
        continue;
      }

      const existing = await attendance.findOne({ username, date });
      if (existing) {
        skipped++;
        continue;
      }

      const studentKey = username.toLowerCase();
      const studentInfo = ALL_STUDENTS[studentKey] || { name: username };

      await attendance.insertOne({
        username: username,
        student_name: studentInfo.name,
        date: date,
        created_at: new Date().toISOString(),
        added_by: req.user.username,
        source: 'manual_admin_entry'
      });

      added++;
    }

    res.json({ message: `Added ${added} entries, skipped ${skipped}`, added, skipped });
  } catch (error) {
    console.error('Bulk add error:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// ============================================
// Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// Export for Vercel
// ============================================
module.exports = app;



