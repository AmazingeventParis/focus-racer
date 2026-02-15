#!/usr/bin/env node
/**
 * Script to setup AWS S3 bucket for Focus Racer
 * Usage: node scripts/setup-s3.js
 */

const {
  S3Client,
  CreateBucketCommand,
  PutBucketCorsCommand,
  PutPublicAccessBlockCommand,
  PutBucketPolicyCommand,
  HeadBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function checkBucketExists(client, bucketName) {
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucketName }));
    return true;
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

async function createBucket(client, bucketName, region) {
  console.log(`\n📦 Création du bucket "${bucketName}"...`);

  try {
    // For us-east-1, don't specify LocationConstraint
    const config = region === 'us-east-1'
      ? {}
      : { CreateBucketConfiguration: { LocationConstraint: region } };

    await client.send(new CreateBucketCommand({
      Bucket: bucketName,
      ...config,
    }));

    console.log(`✅ Bucket "${bucketName}" créé avec succès !`);
    return true;
  } catch (error) {
    if (error.name === 'BucketAlreadyOwnedByYou') {
      console.log(`✅ Bucket "${bucketName}" existe déjà (vous en êtes propriétaire)`);
      return true;
    }
    if (error.name === 'BucketAlreadyExists') {
      console.error(`❌ Le nom "${bucketName}" est déjà pris par quelqu'un d'autre`);
      return false;
    }
    throw error;
  }
}

async function configureCORS(client, bucketName) {
  console.log(`\n🔧 Configuration CORS...`);

  const corsRules = [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
      AllowedOrigins: ['*'], // In production, restrict to your domain
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3000,
    },
  ];

  await client.send(new PutBucketCorsCommand({
    Bucket: bucketName,
    CORSConfiguration: { CORSRules: corsRules },
  }));

  console.log(`✅ CORS configuré`);
}

async function configurePublicAccess(client, bucketName) {
  console.log(`\n🔒 Configuration accès public (bloqué par défaut)...`);

  await client.send(new PutPublicAccessBlockCommand({
    Bucket: bucketName,
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      IgnorePublicAcls: true,
      BlockPublicPolicy: true,
      RestrictPublicBuckets: true,
    },
  }));

  console.log(`✅ Accès public bloqué (sécurité renforcée)`);
  console.log(`   Les fichiers seront accessibles via des URLs signées uniquement`);
}

async function testUploadDownload(client, bucketName) {
  console.log(`\n🧪 Test upload/download...`);

  const testKey = 'test-focusracer.txt';
  const testContent = `Focus Racer S3 Test - ${new Date().toISOString()}`;

  try {
    // Upload
    await client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: testKey,
      Body: Buffer.from(testContent),
      ContentType: 'text/plain',
    }));
    console.log(`✅ Upload test réussi`);

    // Download
    const result = await client.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: testKey,
    }));
    const downloaded = await result.Body.transformToString();

    if (downloaded === testContent) {
      console.log(`✅ Download test réussi`);
    } else {
      console.error(`❌ Le contenu téléchargé ne correspond pas`);
    }

    // Cleanup
    await client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: testKey,
    }));
    console.log(`✅ Fichier test nettoyé`);

    return true;
  } catch (error) {
    console.error(`❌ Erreur lors du test:`, error.message);
    return false;
  }
}

async function updateEnvFile(bucketName, region) {
  console.log(`\n📝 Mise à jour du fichier .env...`);

  const envPath = path.join(__dirname, '..', '.env');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Update AWS_S3_BUCKET
  const bucketRegex = /^AWS_S3_BUCKET=.*$/m;
  if (bucketRegex.test(envContent)) {
    envContent = envContent.replace(bucketRegex, `AWS_S3_BUCKET="${bucketName}"`);
  } else {
    // Add after AWS_REKOGNITION_COLLECTION_ID
    envContent = envContent.replace(
      /AWS_REKOGNITION_COLLECTION_ID=".*"/,
      `AWS_REKOGNITION_COLLECTION_ID="focusracer-faces"\nAWS_S3_BUCKET="${bucketName}"`
    );
  }

  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Fichier .env mis à jour localement`);
}

async function main() {
  console.log('\n🚀 Configuration AWS S3 pour Focus Racer\n');

  // Load existing AWS credentials from .env
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Fichier .env non trouvé. Exécutez d\'abord setup-aws.js');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const regionMatch = envContent.match(/AWS_REGION="?([^"\n]+)"?/);
  const accessKeyMatch = envContent.match(/AWS_ACCESS_KEY_ID="?([^"\n]+)"?/);
  const secretKeyMatch = envContent.match(/AWS_SECRET_ACCESS_KEY="?([^"\n]+)"?/);

  if (!regionMatch || !accessKeyMatch || !secretKeyMatch) {
    console.error('❌ Credentials AWS manquantes dans .env');
    console.error('   Exécutez d\'abord: node scripts/setup-aws.js');
    process.exit(1);
  }

  const region = regionMatch[1];
  const accessKeyId = accessKeyMatch[1];
  const secretAccessKey = secretKeyMatch[1];

  console.log(`📍 Région: ${region}`);
  console.log(`🔑 Access Key: ${accessKeyId.substring(0, 8)}...`);

  const defaultBucketName = `focusracer-${Date.now()}`;
  const bucketName = await question(`\nNom du bucket S3 (défaut: ${defaultBucketName}): `) || defaultBucketName;

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    // Check if bucket exists
    const exists = await checkBucketExists(client, bucketName);

    if (!exists) {
      // Create bucket
      const created = await createBucket(client, bucketName, region);
      if (!created) {
        console.error('\n❌ Impossible de créer le bucket. Essayez un autre nom.');
        rl.close();
        process.exit(1);
      }

      // Wait a bit for bucket to be ready
      console.log('\n⏳ Attente de la disponibilité du bucket...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log(`\n✅ Bucket "${bucketName}" existe déjà`);
    }

    // Configure CORS
    await configureCORS(client, bucketName);

    // Configure public access (blocked)
    await configurePublicAccess(client, bucketName);

    // Test upload/download
    const testSuccess = await testUploadDownload(client, bucketName);

    if (testSuccess) {
      // Update .env
      await updateEnvFile(bucketName, region);

      console.log('\n' + '='.repeat(60));
      console.log('✅ Configuration S3 terminée avec succès !');
      console.log('='.repeat(60));

      console.log('\n📋 Variable à ajouter sur Render:');
      console.log('─'.repeat(60));
      console.log(`AWS_S3_BUCKET=${bucketName}`);
      console.log('─'.repeat(60));

      console.log('\n🎯 Prochaines étapes:');
      console.log('1. Va sur dashboard.render.com');
      console.log('2. Clique sur "focus-racer" (Web Service)');
      console.log('3. Onglet "Environment"');
      console.log('4. Ajoute la variable AWS_S3_BUCKET ci-dessus');
      console.log('5. Clique sur "Save Changes"');
      console.log('6. Render va redéployer automatiquement');
      console.log('\n💡 Les uploads seront maintenant stockés sur S3 de manière permanente !');
      console.log('   Plus de perte de photos lors des redéploiements Render ✨\n');
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    if (error.name === 'InvalidAccessKeyId') {
      console.error('   Les clés AWS sont invalides ou expirées');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.error('   La signature AWS ne correspond pas');
    }
    console.error('\n💡 Vérifiez vos credentials AWS dans .env\n');
  }

  rl.close();
}

main().catch(console.error);
