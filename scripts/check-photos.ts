import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Récupérer le dernier événement avec ses photos
  const event = await prisma.event.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      photos: {
        include: {
          bibNumbers: true
        },
        orderBy: { createdAt: 'desc' },
        take: 30
      }
    }
  })

  if (!event) {
    console.log('Aucun événement trouvé')
    return
  }

  console.log('\n=== ÉVÉNEMENT ===')
  console.log(`ID: ${event.id}`)
  console.log(`Nom: ${event.name}`)
  console.log(`Date: ${event.date}`)
  console.log(`Photos: ${event.photos.length}`)

  console.log('\n=== PHOTOS RÉCENTES ===')
  event.photos.forEach((photo, index) => {
    console.log(`\n${index + 1}. ${photo.path.split('/').pop()}`)
    console.log(`   ID: ${photo.id}`)
    console.log(`   OCR Provider: ${photo.ocrProvider || 'Non traité'}`)
    console.log(`   Dossards détectés: ${photo.bibNumbers.length}`)
    if (photo.bibNumbers.length > 0) {
      photo.bibNumbers.forEach(bib => {
        console.log(`     - ${bib.number} (confiance: ${bib.confidence}%)`)
      })
    }
    console.log(`   Quality Score: ${photo.qualityScore || 'N/A'}`)
    console.log(`   Is Blurry: ${photo.isBlurry}`)
    console.log(`   Auto Edited: ${photo.autoEdited}`)
    console.log(`   Face Indexed: ${photo.faceIndexed}`)
    console.log(`   Web Path: ${photo.webPath ? 'Oui' : 'Non'}`)
    console.log(`   Thumbnail Path: ${photo.thumbnailPath ? 'Oui' : 'Non'}`)
  })

  console.log('\n=== STATISTIQUES ===')
  const withBibs = event.photos.filter(p => p.bibNumbers.length > 0).length
  const withoutBibs = event.photos.filter(p => p.bibNumbers.length === 0).length
  const withOCR = event.photos.filter(p => p.ocrProvider !== null).length
  const withoutOCR = event.photos.filter(p => p.ocrProvider === null).length

  console.log(`Photos avec dossards: ${withBibs}`)
  console.log(`Photos sans dossards: ${withoutBibs}`)
  console.log(`Photos avec OCR traité: ${withOCR}`)
  console.log(`Photos sans OCR traité: ${withoutOCR}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
