const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateOGImages() {
  const browser = await puppeteer.launch();
  
  try {
    // Generate og-image.jpg
    const ogPage = await browser.newPage();
    await ogPage.setViewport({ width: 1200, height: 630 });
    
    const ogHtmlPath = path.join(__dirname, '../public/og-image.html');
    await ogPage.goto(`file://${ogHtmlPath}`);
    
    await ogPage.screenshot({
      path: path.join(__dirname, '../public/og-image.jpg'),
      type: 'jpeg',
      quality: 90
    });
    
    console.log('✅ Generated og-image.jpg');
    
    // Generate twitter-image.jpg
    const twitterPage = await browser.newPage();
    await twitterPage.setViewport({ width: 1200, height: 675 });
    
    const twitterHtmlPath = path.join(__dirname, '../public/twitter-image.html');
    await twitterPage.goto(`file://${twitterHtmlPath}`);
    
    await twitterPage.screenshot({
      path: path.join(__dirname, '../public/twitter-image.jpg'),
      type: 'jpeg',
      quality: 90
    });
    
    console.log('✅ Generated twitter-image.jpg');
    
  } finally {
    await browser.close();
  }
  
  // Clean up HTML files
  try {
    fs.unlinkSync(path.join(__dirname, '../public/og-image.html'));
    fs.unlinkSync(path.join(__dirname, '../public/twitter-image.html'));
    console.log('🧹 Cleaned up temporary HTML files');
  } catch (err) {
    console.log('Note: HTML files were not removed (they may not exist)');
  }
}

generateOGImages().catch(console.error); 