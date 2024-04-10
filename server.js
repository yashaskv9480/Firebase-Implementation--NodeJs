process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require('express');
const multer = require('multer');
const admin = require('firebase-admin');
const dotenv = require('dotenv')
dotenv.config()
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG || {})
const { getStorage, getDownloadURL } = require('firebase-admin/storage');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.STORAGE_BUCKET,
});

const app = express();
const port = process.env.PORT;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const bucket = admin.storage().bucket();
    const imageBuffer = req.file.buffer;
    const imageName = req.file.originalname+("kv");
    console.log(imageBuffer,imageName)
    const file = bucket.file("kv.jpeg"); //Creates a file  
    const result = await file.save(imageBuffer, { contentType: 'image/jpeg' });
    console.log('Image uploaded successfully:', result);
    res.redirect('/');
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send('Error uploading image.');
  }
});

app.get('/images', async (req, res) => {
    try {
      const bucket = admin.storage().bucket();
      const fileRef = bucket.file("kv.jpeg");
      const downloadURL= await getDownloadURL(fileRef);

      res.send(downloadURL);
    } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).send('Error fetching images.');
    }
  });



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});