const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 5000;
const multer = require('multer');
const crypto = require('crypto');
const { log } = require('console');
const secret = '49d6ac6f1f638f54f0274c99ad50c5921ad445f5c9e5b7c79f5af956e1c31eb9'
console.log(secret,'secretsecretsecretsecret');
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Connect to MongoDB
mongoose.connect('mongodb+srv://sid1998verma:admin@cluster0.gox1htp.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on('connected', () => {
  console.log('Connected to MongoDB');
});

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: {type: String, default: "USER", enum:['ADMIN', "USER"]},
  isDeleted: {type: Boolean, default: false},
  image: {type:String, default:''}
});

const User = mongoose.model('User', userSchema);



const isAdminAuth = async (req, res, next) => {
  try {
    if (req.headers && req.headers.authorization) {
      const accessToken = req.headers.authorization;
      console.log('token',accessToken);
      const decodeData = await jwt.verify(accessToken, secret);
      if (!decodeData) {
        return res.status(400).json({ error: 'Invalid Token' });
       
      }
      let adminData = await User.findOne({
        _id: decodeData._id,
        role: "ADMIN",
        isDeleted: "false"
      });
      if (!adminData) {
        return res.status(400).json({ error: 'Invalid Token' });
      }
      req.user = adminData;
      next();
    } else {
      return res.status(400).json({ error: 'Token missing' });
    }
  } catch (error) {
    
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
};
const isUserAuth = async (req, res, next) => {
  try {
    if (req.headers && req.headers.authorization) {
      const accessToken = req.headers.authorization.split(' ')[1];
      const decodeData = jwt.verify(accessToken, secret);
      if (!decodeData) {
        return res.status(400).json({ error: 'Invalid Token' });
       
      }
      let userData = await User.findOne({
        _id: decodeData._id,
        isDeleted: "false"
      });
      if (!userData) {
        return res.status(400).json({ error: 'Invalid Token' });
      }
      req.user = userData;
      next();
    } else {
      return res.status(400).json({ error: 'Token missing' });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
};

app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username, password,"kkkkkkkkkkkkkkkkkkk")
    const hashedPassword = await bcrypt.hash(password, 10); 
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(200).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate a JWT token for authentication
    const token = jwt.sign({ username: user.username, _id:user._id }, secret, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ... (your existing user schema and routes)
app.post('/api/upload-image',isUserAuth, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate({
      _id: req.user._id,
      isDeleted: false
    },{
      $set:{
        image:req.body.image
      }
    }
    )
    // console.log(user,'useruseruseruseruser')
    res.status(200).json({message:"Done"})
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


app.get('/api/userProfile',isUserAuth, async (req, res)=>{
  const user = await User.findOneAndUpdate({
    _id: req.user._id,
    isDeleted: false
  }
)
  res.status(200).json({message:"Done",data:user})
})

app.get('/api/allUser',isAdminAuth, async (req, res)=>{
  const user = await User.find({
    isDeleted: false
  }
)
  res.status(200).json({message:"Done",data:user})
})


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



