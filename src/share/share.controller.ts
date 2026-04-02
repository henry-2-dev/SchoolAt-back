import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../auth/public.decorator';

@Controller('share')
export class ShareController {
  @Public()
  @Get('post/:id')
  async redirectPost(@Param('id') id: string, @Res() res: Response) {
    const deepLink = `schoolat://post/${id}`;
    
    // On renvoie une page HTML simple qui tente d'ouvrir l'app via le deep link
    // Si l'app n'est pas installée, on peut afficher un message de téléchargement (MVP)
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SchoolAt - Partage</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <!-- OpenGraph tags pour un bel aperçu WhatsApp / Facebook -->
        <meta property="og:title" content="Découvrez une école sur SchoolAt">
        <meta property="og:description" content="Cliquez pour voir ce contenu dans l'application SchoolAt.">
        <meta property="og:image" content="https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg">
        <style>
          body { font-family: sans-serif; text-align: center; padding-top: 100px; background-color: #F2EF81; }
          .btn { display: inline-block; padding: 15px 30px; background-color: #000; color: #fff; text-decoration: none; border-radius: 50px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Chargement de SchoolAt...</h1>
        <p>Si l'application ne s'ouvre pas automatiquement, cliquez sur le bouton ci-dessous :</p>
        <a href="${deepLink}" class="btn">Ouvrir dans l'application</a>
        
        <script>
          // Tentative automatique d'ouverture du Deep Link
          window.location.href = "${deepLink}";
          
          // Fallback après 3 secondes si rien ne se passe
          setTimeout(function() {
            console.info("Deep link redirection probably failed or app not installed.");
          }, 3000);
        </script>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  }
}
