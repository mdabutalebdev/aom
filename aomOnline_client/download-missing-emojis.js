const fs = require('fs');
const https = require('https');
const path = require('path');

const dir = 'public/assets/fluent';

const emojis = {
  'boy_desk': [
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man%20student/Default/3D/man_student_3d_default.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Boy/Default/3D/boy_3d_default.png'
  ],
  'boy_standing': [
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Person%20raising%20hand/Default/3D/person_raising_hand_3d_default.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man/Default/3D/man_3d_default.png'
  ],
  'boy_thumbs': [
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Thumbs%20up/Default/3D/thumbs_up_3d_default.png',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Thumbs%20up/3D/thumbs_up_3d_default.png'
  ]
};

function downloadFallback(key, urls) {
  if (urls.length === 0) {
    console.log('Failed completely for ' + key);
    return;
  }
  const url = urls[0];
  const dest = path.join(dir, `${key}.png`);
  
  https.get(url, res => {
    if (res.statusCode === 200) {
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); console.log('Downloaded ' + key + ' from ' + url); });
    } else {
      downloadFallback(key, urls.slice(1));
    }
  }).on('error', () => {
    downloadFallback(key, urls.slice(1));
  });
}

Object.entries(emojis).forEach(([key, urls]) => {
  downloadFallback(key, urls);
});
