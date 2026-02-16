// Script pour tester quel provider OCR est utilisé
import { aiConfig } from '../src/lib/ai-config'

console.log('\n=== CONFIGURATION IA ===\n')

console.log('AWS Rekognition disponible:', aiConfig.awsEnabled ? '✅ OUI' : '❌ NON')
console.log('AWS Region:', process.env.AWS_REGION || 'Non configuré')
console.log('AWS Access Key:', process.env.AWS_ACCESS_KEY_ID ? `${process.env.AWS_ACCESS_KEY_ID.substring(0, 8)}...` : 'Non configuré')
console.log('S3 Bucket:', process.env.AWS_S3_BUCKET || 'Non configuré')
console.log('Rekognition Collection:', process.env.AWS_REKOGNITION_COLLECTION_ID || 'Non configuré')

console.log('\nFeatures activées:')
console.log('- Auto-edit:', aiConfig.autoEditEnabled ? '✅' : '❌')
console.log('- Face indexing:', aiConfig.faceIndexEnabled ? '✅' : '❌')
console.log('- Label detection:', aiConfig.labelDetectionEnabled ? '✅' : '❌')

console.log('\nSeuils:')
console.log('- OCR Confidence:', aiConfig.ocrConfidenceThreshold)
console.log('- Quality:', aiConfig.qualityThreshold)
console.log('- Max Concurrent:', process.env.AI_MAX_CONCURRENT || '4 (défaut)')

console.log('\n=== PROVIDER OCR QUI SERA UTILISÉ ===')
if (aiConfig.awsEnabled) {
  console.log('✅ AWS Rekognition (Mode Premium)')
  console.log('   - Vitesse: ~0.3s/photo')
  console.log('   - Précision: 85-95%')
} else {
  console.log('⚠️  Tesseract.js (Mode Gratuit - Fallback)')
  console.log('   - Vitesse: ~10-30s/photo')
  console.log('   - Précision: 10-30%')
  console.log('\n⚠️  ATTENTION: Pour utiliser AWS Rekognition, configurez les variables AWS_*')
}
