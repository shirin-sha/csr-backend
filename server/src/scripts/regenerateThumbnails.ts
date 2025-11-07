import path from 'path'
import fs from 'fs/promises'
import mongoose from 'mongoose'
import sharp from 'sharp'

import { DB } from '../config/variables'
import { blogSchema } from '../models/blogs'

const IMAGES_DIR = path.join(__dirname, '../../images')
const THUMBNAILS_DIR = path.join(IMAGES_DIR, 'thumbnails')

async function ensureDirectoryExists(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

async function regenerateBlogThumbnails() {
  await ensureDirectoryExists(THUMBNAILS_DIR)

  const blogs = await blogSchema.find({}).lean()

  for (const blog of blogs) {
    const filename = blog.img

    if (!filename) {
      continue
    }

    const originalPath = path.join(IMAGES_DIR, filename)
    const thumbnailPath = path.join(THUMBNAILS_DIR, filename)

    try {
      await fs.access(thumbnailPath)
      console.log(`Thumbnail already exists for ${filename}`)
      continue
    } catch (err) {
      // Thumbnail missing - fall through to regenerate if source exists
    }

    try {
      await fs.access(originalPath)
    } catch (err) {
      console.warn(`⚠️  Original image missing for ${filename}, skipping thumbnail generation`)
      continue
    }

    try {
      await sharp(originalPath).resize(320, 200).toFile(thumbnailPath)
      console.log(`✅ Generated thumbnail for ${filename}`)
    } catch (err) {
      console.error(`❌ Failed to generate thumbnail for ${filename}`, err)
    }
  }
}

async function main() {
  try {
    if (!DB) {
      throw new Error('DB connection string is not defined. Check the DB variable in the environment file.')
    }

    await mongoose.connect(DB)
    console.log('Connected to MongoDB')

    await regenerateBlogThumbnails()

    console.log('Thumbnail regeneration complete')
  } catch (err) {
    console.error('Failed to regenerate thumbnails', err)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

main()

