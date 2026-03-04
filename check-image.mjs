import sharp from 'sharp';

async function blurImage() {
    const metadata = await sharp('images/photographs/community-ice-bath.jpeg').metadata();
    console.log(`Width: ${metadata.width}, Height: ${metadata.height}`);
}

blurImage().catch(console.error);
