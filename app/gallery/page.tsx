import type { Metadata } from 'next'
import { MediaGallery } from '@/components/gallery/MediaGallery'

export const metadata: Metadata = {
  title: 'Say So — Product Gallery',
  description:
    'A voice-first English classroom. See how Say So listens, corrects, and turns pronunciation practice into confidence.',
}

export default function GalleryPage() {
  return <MediaGallery />
}