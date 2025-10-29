const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

async function uploadFile(fileBuffer, fileName, mimeType) {
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  };

  try {
    await s3.upload(params).promise();
    console.log('✅ File uploaded successfully:', fileName);
    // Return just the key (filename) to store in database
    return fileName;
  } catch (error) {
    console.error('❌ S3 Upload Error:', error);
    throw error;
  }
}

// Generate signed URL for accessing private S3 objects
function getSignedUrl(key, expiresInSeconds = 60 * 60 * 24) { // 1 day default
  if (!key) return null;
  
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: key,
    Expires: expiresInSeconds
  };
  
  return s3.getSignedUrl('getObject', params);
}

s3.listBuckets((err, data) => {
  if (err) console.error('❌ S3 Connection Error:', err.message);
  else console.log('✅ S3 Connected! Buckets:', data.Buckets.map(b => b.Name));
});

module.exports = { uploadFile, getSignedUrl };
