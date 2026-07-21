import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('c:/Users/USER/Desktop/sleepy-backend/sleepy-backend/src/main/resources/firebase-service-account.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function check() {
  const snapshot = await db.collection('notifications').get();
  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }  
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
  
  // also check subcollections
  const docs = snapshot.docs;
  for (const d of docs) {
     const sub = await db.collection('notifications').doc(d.id).collection('userNotifications').get();
     sub.forEach(sd => {
        console.log(`  Sub: ${sd.id} =>`, sd.data());
     });
  }
}

check().catch(console.error);
