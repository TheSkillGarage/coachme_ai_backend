import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_NAME'),
      api_key: this.config.get<string>('CLOUDINARY_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_SECRET'),
    });
  }

  async uploadAvatar(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'avatars',
            transformation: [
              { width: 200, height: 200, crop: 'fill', gravity: 'face' },
              { quality: 'auto', fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) {
              reject(new Error(`Cloudinary upload failed: ${error.message}`));
            } else {
              resolve(result!);
            }
          },
        )
        .end(file.buffer);
    });
  }

  async uploadResume(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'resumes',
            resource_type: 'raw',
            allowed_formats: ['pdf', 'docx', 'doc'],
          },
          (error, result) => {
            if (error) {
              reject(
                new Error(`Cloudinary resume upload failed: ${error.message}`),
              );
            } else {
              resolve(result!);
            }
          },
        )
        .end(file.buffer);
    });
  }

  async delete(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new Error(
        `Failed to delete from Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  getSignedUrl(publicId: string, expiresIn = 3600): string {
    return cloudinary.url(publicId, {
      secure: true,
      sign_url: true,
      type: 'authenticated',
      expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    });
  }
}
