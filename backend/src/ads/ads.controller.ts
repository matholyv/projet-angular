import { Controller, Get, Post, Body, Query, Param, UseInterceptors, UploadedFiles, Delete } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { AdsService } from './ads.service';

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const multerOptions = {
  storage: diskStorage({
    destination: (req: any, file: any, cb: any) => {
      cb(null, uploadDir);
    },
    filename: (req: any, file: any, cb: any) => {
      const ext = path.extname(file.originalname);
      const filename = `${uuidv4()}${ext}`;
      cb(null, filename);
    }
  })
};

@Controller('products')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.adsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adsService.findOne(+id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images', 6, multerOptions))
  async create(@Body() createAdDto: any, @UploadedFiles() files: any[]) {
    // Les fichiers sont sauvegardés par Multer. On récupère juste leurs noms.
    const imagePaths = files && files.length > 0 
        ? files.map(file => `/uploads/${file.filename}`) 
        : [];
    
    // On fusionne les liens URL des images avec les données texte de l'annonce
    const payload = {
       ...createAdDto,
       image_data: JSON.stringify(imagePaths)
    };

    return this.adsService.create(payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adsService.remove(+id);
  }
}
